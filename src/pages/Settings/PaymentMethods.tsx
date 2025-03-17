import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { paymentApi, Card } from '../../network/api';

// Initialize Stripe with the publishable key from environment variables
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

const AddCardForm = ({ onSuccess, onCancel }: { onSuccess: (card: Card) => void; onCancel: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);

  const handleCardChange = (event: any) => {
    setCardComplete(event.complete);
    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setError('Stripe has not been initialized');
      return;
    }

    if (!cardComplete) {
      setError('Please complete card details');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create a setup intent
      const { clientSecret } = await paymentApi.createSetupIntent();

      // Confirm the setup
      const { setupIntent, error: setupError } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {}
        },
      });

      if (setupError) {
        throw new Error(setupError.message);
      }

      if (!setupIntent || setupIntent.status !== 'succeeded') {
        throw new Error('Failed to setup payment method');
      }

      const paymentMethodId = setupIntent.payment_method;
      if (!paymentMethodId) {
        throw new Error('No payment method ID returned');
      }

      // Get the payment method details
      const { paymentMethod } = await stripe.paymentMethods.retrieve(paymentMethodId);
      if (!paymentMethod || !paymentMethod.card) {
        throw new Error('Failed to retrieve payment method details');
      }

      // Confirm with backend
      const { card } = await paymentApi.confirmSetupIntent({
        clientSecret,
        paymentMethod: {
          id: paymentMethodId,
          last4: paymentMethod.card.last4 || '',
          brand: paymentMethod.card.brand || 'unknown',
          exp_month: paymentMethod.card.exp_month || 1,
          exp_year: paymentMethod.card.exp_year || 2024
        }
      });

      onSuccess(card);
      toast.success('Payment method added successfully');
    } catch (err: any) {
      console.error('Error adding payment method:', err);
      setError(err.message || 'Failed to add payment method');
      toast.error(err.message || 'Failed to add payment method');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Add Payment Method</h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500"
          disabled={isProcessing}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mb-6">
        <div className="p-4 bg-white rounded border border-gray-200">
          <CardElement 
            options={CARD_ELEMENT_OPTIONS}
            onChange={handleCardChange}
            className="w-full"
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || !cardComplete || isProcessing}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Add Card'}
        </button>
      </div>
    </form>
  );
};

export const PaymentMethods = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const data = await paymentApi.getCards();
        setCards(data);
      } catch (error) {
        console.error('Error fetching cards:', error);
        toast.error('Failed to load payment methods');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
  }, []);

  const handleSetDefault = async (cardId: number) => {
    try {
      await paymentApi.setDefaultPaymentMethod(cardId);
      setCards(prev => prev.map(card => ({
        ...card,
        isDefault: card.id === cardId
      })));
      toast.success('Default payment method updated');
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast.error('Failed to update default payment method');
    }
  };

  const handleDelete = async (cardId: number) => {
    try {
      await paymentApi.deletePaymentMethod(cardId);
      setCards(prev => prev.filter(card => card.id !== cardId));
      toast.success('Payment method deleted');
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error('Failed to delete payment method');
    }
  };

  const handleAddCardSuccess = (card: Card) => {
    setCards(prev => [...prev, card]);
    setShowAddCard(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:px-6 flex items-center">
            <Link 
              to="/settings/subscription"
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
          </div>
          
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {cards.map(card => (
                <li key={card.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img 
                        src={`https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat/${card.brand.toLowerCase()}.svg`}
                        alt={card.brand}
                        className="h-8 w-12 object-contain"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {card.brand} ending in {card.last4}
                        </p>
                        <p className="text-sm text-gray-500">
                          Expires {card.expMonth}/{card.expYear}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {!card.isDefault && (
                        <>
                          <button
                            onClick={() => handleSetDefault(card.id)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Make Default
                          </button>
                          <button
                            onClick={() => handleDelete(card.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      {card.isDefault && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {showAddCard ? (
            <div className="px-4 py-4 sm:px-6 border-t border-gray-200">
              <Elements stripe={stripePromise}>
                <AddCardForm
                  onSuccess={handleAddCardSuccess}
                  onCancel={() => setShowAddCard(false)}
                />
              </Elements>
            </div>
          ) : (
            <div className="px-4 py-4 sm:px-6 border-t border-gray-200">
              <button
                onClick={() => setShowAddCard(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Payment Method
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};