import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Check, Gift } from 'lucide-react';

const features = [
  'Unmask blocked calls',
  'Block harassing callers',
  'Spam protection',
  'Privacy Lock',
  'Missed call alerts',
  'Name & Address Caller ID',
  'Unlimited reverse number lookups',
  'Unlimited transcriptions',
  'Unlimited Call recording'
];

export const ActivationPage = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'weekly' | 'yearly'>('yearly');

  const handleContinue = () => {
    navigate('/add-payment-method', { 
      state: { billingCycle } 
    });
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Start your free trial
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Try TrapCall Ultimate free for 7 days
          </p>
        </div>

        {/* Trial Message */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 mb-8 text-white">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Gift className="h-8 w-8" />
              <h2 className="text-xl font-semibold">7-Day Free Trial</h2>
            </div>
            <p className="text-purple-100">
              Experience all Ultimate features free for 7 days. Cancel anytime during your trial.
            </p>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center bg-gray-100 p-1 rounded-full">
            <button
              onClick={() => setBillingCycle('weekly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                billingCycle === 'weekly'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Weekly
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
                Save 75%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-purple-200">
          <div className="bg-purple-500 text-white text-sm font-medium text-center py-2 rounded-t-2xl">
            ULTIMATE PROTECTION
          </div>
          <div className="p-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-2xl font-bold text-gray-900">Ultimate Plan</h3>
              <div className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                7 Days Free
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-gray-900">
                  {billingCycle === 'weekly' ? formatPrice(7.99) : formatPrice(99.99)}
                </span>
                <span className="text-gray-500 ml-2">
                  /{billingCycle === 'weekly' ? 'week' : 'year'}
                </span>
              </div>
              <div className="mt-2">
                {billingCycle === 'yearly' && (
                  <p className="text-sm text-green-600">
                    Save 75% with annual billing
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  After your free trial
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-purple-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleContinue}
              className="w-full py-4 px-6 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Start Free Trial
            </button>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="space-y-2 text-center">
                <p className="text-sm text-gray-600">
                  <Shield className="h-4 w-4 inline mr-1" />
                  Secure payment with 256-bit encryption
                </p>
                <p className="text-xs text-gray-500">
                  Cancel anytime during your trial. No activation fees.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            By starting your free trial, you agree to our{' '}
            <a href="#" className="text-purple-600 hover:text-purple-700">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-purple-600 hover:text-purple-700">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};