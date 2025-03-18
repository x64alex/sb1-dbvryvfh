import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

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

export const ReactivatePage = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'weekly' | 'yearly'>('yearly');

  const handleContinue = () => {
    toast.success('Successfully reactivated Ultimate Plan');
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
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
              <p className="text-gray-600">Reactivate your Ultimate plan to continue enjoying premium protection</p>
            </div>
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
            <h3 className="text-2xl font-bold text-gray-900 mb-5">
              Ultimate Plan
            </h3>
            <div className="mb-8">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-gray-900">
                  {billingCycle === 'weekly' ? formatPrice(7.99) : formatPrice(99.99)}
                </span>
                <span className="text-gray-500 ml-2">
                  /{billingCycle === 'weekly' ? 'week' : 'year'}
                </span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-sm text-green-600 mt-2">
                  Save 75% with annual billing
                </p>
              )}
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
              Reactivate Ultimate Plan
            </button>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-center text-gray-500">
                Cancel anytime. No activation fees.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            By reactivating, you agree to our{' '}
            <a href="#" className="text-purple-600 hover:text-purple-700">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-purple-600 hover:text-purple-700">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};