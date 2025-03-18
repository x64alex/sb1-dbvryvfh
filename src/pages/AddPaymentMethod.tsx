import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Shield, ArrowLeft, CreditCard, Check, Calendar, Lock, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { paymentApi } from '../network/api';
import { useAuth } from '../context/AuthProvider';

// Initialize Stripe with the publishable key from environment variables
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      padding: '10px 0',
    },
    invalid: {
      color: '#9e2146',
      iconColor: '#9e2146',
    },
  },
};

type PaymentMethod = 'card' | 'paypal';

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [postalCode, setPostalCode] = useState('');

  const { billingCycle } = location.state || { billingCycle: 'yearly' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedMethod === 'paypal') {
      toast.error('PayPal integration coming soon!');
      return;
    }

    if (!stripe || !elements) {
      return;
    }

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) {
      return;
    }

    if (!postalCode) {
      setError('Postal code is required');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create a setup intent with billing cycle
      const { clientSecret } = await paymentApi.createSetupIntent(billingCycle);

      // Create payment method
      const { setupIntent, error: setupError } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardNumber,
          billing_details: {
            address: {
              postal_code: postalCode
            }
          }
        },
      });

      if (setupError) {
        throw new Error(setupError.message);
      }

      if (!setupIntent || setupIntent.status !== 'succeeded') {
        throw new Error('Failed to setup payment method');
      }

      // Confirm setup and create subscription
      const response = await paymentApi.confirmSetupIntent({
        paymentMethodId: setupIntent.payment_method as string,
        billingCycle
      });

      // Update auth context with new user data
      if (response.user) {
        updateUser(response.user);
      }

      toast.success('Payment method added and trial started!');
      navigate('/settings/subscription');
    } catch (err: any) {
      console.error('Error processing payment:', err);
      setError(err.message || 'An error occurred while processing your payment');
      toast.error(err.message || 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Payment Method Selection */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setSelectedMethod('card')}
          className={`p-6 rounded-lg border-2 transition-all ${
            selectedMethod === 'card'
              ? 'border-purple-600 bg-purple-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className={`h-5 w-5 ${
                selectedMethod === 'card' ? 'text-purple-600' : 'text-gray-400'
              }`} />
              <span className="ml-2 font-medium">Credit Card</span>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selectedMethod === 'card'
                ? 'border-purple-600 bg-purple-600'
                : 'border-gray-300'
            }`}>
              {selectedMethod === 'card' && (
                <Check className="h-3 w-3 text-white" />
              )}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedMethod('paypal')}
          className={`p-6 rounded-lg border-2 transition-all ${
            selectedMethod === 'paypal'
              ? 'border-purple-600 bg-purple-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src="https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat/paypal.svg" 
                alt="PayPal" 
                className="h-5" 
              />
              <span className="ml-2 font-medium">PayPal</span>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selectedMethod === 'paypal'
                ? 'border-purple-600 bg-purple-600'
                : 'border-gray-300'
            }`}>
              {selectedMethod === 'paypal' && (
                <Check className="h-3 w-3 text-white" />
              )}
            </div>
          </div>
        </button>
      </div>

      {/* Card Form */}
      {selectedMethod === 'card' && (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card number
              </label>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <CardNumberElement 
                  options={CARD_ELEMENT_OPTIONS}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Expiration date
                  </span>
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <CardExpiryElement 
                    options={CARD_ELEMENT_OPTIONS}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center">
                    <Lock className="h-4 w-4 mr-1" />
                    Security code
                  </span>
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <CardCvcElement 
                    options={CARD_ELEMENT_OPTIONS}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Postal code
                </span>
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Enter postal code"
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <p className="text-sm text-gray-600">
                You won't be charged during your 7-day free trial. After that, you'll be charged{' '}
                {billingCycle === 'weekly' ? '$7.99 weekly' : '$99.99 yearly'}.
              </p>
              <p className="text-sm text-gray-600">
                Cancel anytime during your trial and you won't be charged.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PayPal Info */}
      {selectedMethod === 'paypal' && (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600">
            You'll be redirected to PayPal to complete your payment securely.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={selectedMethod === 'card' ? (!stripe || isProcessing) : false}
        className="w-full py-4 px-6 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : 'Start Free Trial'}
      </button>
    </form>
  );
};

export const AddPaymentMethod = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-32">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">
            Add Payment Method
          </h1>
          <p className="mt-2 text-gray-600">
            Choose your preferred payment method
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-12 flex items-center gap-3">
          <Shield className="h-6 w-6 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-900">
            Your payment information is securely encrypted and stored by our trusted payment providers.
          </p>
        </div>

        <Elements stripe={stripePromise}>
          <PaymentForm />
        </Elements>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            By continuing, you agree to our{' '}
            <a href="#" className="text-purple-600 hover:text-purple-700">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-purple-600 hover:text-purple-700">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};