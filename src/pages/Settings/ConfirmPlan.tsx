import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Calendar, Check, Shield, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { planApi, PlanFeature, paymentApi, Card, subscriptionApi } from '../../network/api';

interface PlanPricing {
  month: number;
  year: number;
  two_years: number;
}

export const ConfirmPlan = () => {
  const { planId = '' } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<'month' | 'year' | 'two_years'>('month');
  const [features, setFeatures] = useState<PlanFeature[]>([]);
  const [card, setCard] = useState<Card | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [pricing, setPricing] = useState<PlanPricing | null>(null);

  const planName = planId.charAt(0).toUpperCase() + planId.slice(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuresData, cardsData, subscriptionData, pricingData] = await Promise.all([
          planApi.getPlanFeatures(planId),
          paymentApi.getCards(),
          subscriptionApi.getSubscription(),
          planApi.getPlanPricing(planId)
        ]);
        setFeatures(featuresData);
        setCard(cardsData.find(c => c.isDefault) || cardsData[0] || null);
        setCurrentSubscription(subscriptionData);
        setPricing(pricingData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load plan details');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [planId]);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await planApi.changePlan({
        planId,
        duration: selectedDuration
      });
      toast.success('Plan changed successfully!');
      navigate('/settings/subscription');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change plan');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number, duration: 'month' | 'year' | 'two_years') => {
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);

    switch (duration) {
      case 'month':
        return `${formattedPrice}/month`;
      case 'year':
        return `${formattedPrice}/year`;
      case 'two_years':
        return `${formattedPrice}/2 years`;
    }
  };

  const getAnnualSavings = (duration: 'year' | 'two_years') => {
    if (!pricing) return 0;
    const monthlyTotal = pricing.month * (duration === 'year' ? 12 : 24);
    const actualTotal = pricing[duration];
    return ((monthlyTotal - actualTotal) / monthlyTotal * 100).toFixed(0);
  };

  if (loadingData || !pricing) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <Link 
                to="/settings/change-plan"
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Confirm your new plan</h1>
                <p className="text-lg text-gray-600 mt-1">
                  {formatPrice(pricing[selectedDuration], selectedDuration)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Plan Summary */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-4">
                <Shield className="h-8 w-8 text-blue-600 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    You chose to change your plan to our {planName} subscription
                  </h2>
                  <p className="mt-2 text-gray-600">
                    You will have access to the following features:
                  </p>
                </div>
              </div>

              {/* Features Grid */}
              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      feature.included ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                    <span className={`${feature.included ? 'text-gray-700' : 'text-gray-500'}`}>
                      {feature.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            {card && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  Payment Method
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded">
                      <img 
                        src={`https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat/${card.brand.toLowerCase()}.svg`}
                        alt={card.brand}
                        className="h-6"
                      />
                    </div>
                    <div>
                      <p className="font-medium">Card ending in {card.last4}</p>
                      <p className="text-sm text-gray-500">
                        Expires {card.expMonth}/{card.expYear}
                      </p>
                    </div>
                  </div>
                  <span className="text-green-600 text-sm font-medium">valid</span>
                </div>
              </div>
            )}

            {/* Plan Duration */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                Plan Duration
              </h3>
              <div className="space-y-3">
                <label 
                  className={`block relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    selectedDuration === 'month' 
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="duration"
                    value="month"
                    checked={selectedDuration === 'month'}
                    onChange={() => setSelectedDuration('month')}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Monthly</p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(pricing.month, 'month')}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedDuration === 'month'
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                    }`}>
                      {selectedDuration === 'month' && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                </label>

                <label 
                  className={`block relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    selectedDuration === 'year' 
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="duration"
                    value="year"
                    checked={selectedDuration === 'year'}
                    onChange={() => setSelectedDuration('year')}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Annual</p>
                      <div>
                        <p className="text-sm text-gray-500">
                          {formatPrice(pricing.year, 'year')}
                        </p>
                        <p className="text-sm text-green-600">
                          Save {getAnnualSavings('year')}%
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedDuration === 'year'
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                    }`}>
                      {selectedDuration === 'year' && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                </label>

                <label 
                  className={`block relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    selectedDuration === 'two_years' 
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="duration"
                    value="two_years"
                    checked={selectedDuration === 'two_years'}
                    onChange={() => setSelectedDuration('two_years')}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">2 Years</p>
                      <div>
                        <p className="text-sm text-gray-500">
                          {formatPrice(pricing.two_years, 'two_years')}
                        </p>
                        <p className="text-sm text-green-600">
                          Save {getAnnualSavings('two_years')}%
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedDuration === 'two_years'
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                    }`}>
                      {selectedDuration === 'two_years' && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`flex-1 py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? 'Processing...' : 'Confirm Plan Change'}
              </button>
              <Link
                to="/settings/change-plan"
                className="flex-1 py-3 px-4 rounded-lg text-center border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};