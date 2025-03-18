import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Check } from 'lucide-react';
import { subscriptionApi } from '../../network/api';
import { toast } from 'react-hot-toast';

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  isBestValue?: boolean;
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    monthlyPrice: 4.95,
    yearlyPrice: 49.95,
    features: [
      'Reveal blocked callers and block them',
      'Automatically block spam calls from over 100,000 numbers',
      'Look up Caller ID for any number'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: 7.95,
    yearlyPrice: 79.95,
    isBestValue: true,
    features: [
      'Everything from Basic Plan',
      'See names and addresses of callers you don\'t recognize',
      'Record 10 incoming calls'
    ]
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    monthlyPrice: 10.83,
    yearlyPrice: 108.95,
    features: [
      'Everything from Premium Plan',
      'Record UNLIMITED incoming calls'
    ]
  }
];

export const ReactivatePage = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');

  const handleContinue = () => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;

    toast.success(`Successfully reactivated ${plan.name} Plan`);
    navigate('/settings/subscription');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Reactivate your subscription
          </h1>
        </div>

        {/* Welcome Back Message */}
        <div className="text-center mb-12">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 inline-flex items-center gap-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <div className="text-left">
              <h2 className="font-semibold text-gray-900">Welcome back!</h2>
            </div>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center bg-gray-100 p-1 rounded-full">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
                billingCycle === 'yearly'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const isSelected = selectedPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl shadow-sm transition-all ${
                  isSelected ? 'ring-2 ring-blue-600 shadow-lg' : 'hover:shadow-lg border border-gray-200'
                }`}
              >
                {plan.isBestValue && (
                  <div className="bg-orange-500 text-white text-sm font-medium text-center py-2 rounded-t-2xl">
                    BEST VALUE
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center justify-between">
                    {plan.name}
                  </h3>
                  <div className="mb-5">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">
                        {formatPrice(price)}
                      </span>
                      <span className="text-gray-500 ml-2">
                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <p className="text-sm text-green-600 mt-2">
                        Save 17% annually
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full py-3 px-4 rounded-lg font-medium mb-8 transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select Plan'}
                  </button>

                  <div className="space-y-4">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="text-xs text-center text-gray-500">
                      DOES NOT REQUIRE ACTIVATION FEE
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="mt-12 text-center">
          <button
            onClick={handleContinue}
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Reactivate {plans.find(p => p.id === selectedPlan)?.name} Plan
          </button>
        </div>
      </div>
    </div>
  );
};
