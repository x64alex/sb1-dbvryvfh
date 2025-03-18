import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Shield, CreditCard, Clock, Settings, ChevronRight, CheckCircle } from 'lucide-react';
import { subscriptionApi, SubscriptionResponse, planApi, PlanFeature } from '../../network/api';

export const Subscription = () => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionResponse | null>(null);
  const [currentFeatures, setCurrentFeatures] = useState<PlanFeature[]>([]);
  const [premiumFeatures, setPremiumFeatures] = useState<PlanFeature[]>([]);
  const [ultimateFeatures, setUltimateFeatures] = useState<PlanFeature[]>([]);
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<'premium' | 'ultimate'>('premium');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pricing, setPricing] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await subscriptionApi.getSubscription();
        
        if (!data) {
          throw new Error('No subscription data received');
        }
        
        setSubscriptionData(data);
        
        // Get current plan features and pricing
        const currentPlanId = data?.category?.toLowerCase() || 'basic';
        const [currentFeatures, currentPricing] = await Promise.all([
          planApi.getPlanFeatures(currentPlanId),
          planApi.getPlanPricing(currentPlanId)
        ]).catch(error => {
          console.error('Error fetching plan details:', error);
          return [[], {}] as [PlanFeature[], Record<string, number>];
        });

        setCurrentFeatures(currentFeatures);
        setPricing({ [currentPlanId]: currentPricing });

        // If on basic plan, get both premium and ultimate features
        if (currentPlanId === 'basic') {
          try {
            const [premiumFeatures, ultimateFeatures, premiumPricing, ultimatePricing] = await Promise.all([
              planApi.getPlanFeatures('premium'),
              planApi.getPlanFeatures('ultimate'),
              planApi.getPlanPricing('premium'),
              planApi.getPlanPricing('ultimate')
            ]);
            setPremiumFeatures(premiumFeatures);
            setUltimateFeatures(ultimateFeatures);
            setPricing(prev => ({
              ...prev,
              premium: premiumPricing,
              ultimate: ultimatePricing
            }));
          } catch (error) {
            console.error('Error fetching upgrade plans:', error);
          }
        } else if (currentPlanId === 'premium') {
          try {
            const [ultimateFeatures, ultimatePricing] = await Promise.all([
              planApi.getPlanFeatures('ultimate'),
              planApi.getPlanPricing('ultimate')
            ]);
            setUltimateFeatures(ultimateFeatures);
            setPricing(prev => ({
              ...prev,
              ultimate: ultimatePricing
            }));
          } catch (error) {
            console.error('Error fetching ultimate plan:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setSubscriptionData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (unixtime: number) => {
    return format(new Date(unixtime * 1000), 'MMM dd, yyyy');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDuration = (duration: string) => {
    switch (duration) {
      case 'two_years':
        return '2 years';
      case 'year':
        return 'year';
      case 'month':
        return 'month';
      default:
        return duration;
    }
  };

  const renderFeatureText = (text: string) => {
    if (text.toLowerCase().includes('unlimited')) {
      return (
        <span>
          <u>Unlimited</u>{text.substring(9)}
        </span>
      );
    }
    return text;
  };

  const getUpgradeFeatures = () => {
    if (!subscriptionData?.category) return [];
    const currentPlanId = subscriptionData.category.toLowerCase();
    
    if (currentPlanId === 'basic') {
      const targetFeatures = selectedUpgradePlan === 'premium' ? premiumFeatures : ultimateFeatures;
      return targetFeatures.filter(targetFeature => {
        const currentFeature = currentFeatures.find(cf => cf.title === targetFeature.title);
        return !currentFeature?.included && targetFeature.included;
      });
    } else if (currentPlanId === 'premium') {
      return ultimateFeatures.filter(targetFeature => {
        const currentFeature = currentFeatures.find(cf => cf.title === targetFeature.title);
        return !currentFeature?.included && targetFeature.included;
      });
    }
    
    return [];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!subscriptionData) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center text-red-600">
              <p>Error loading subscription data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPlanId = subscriptionData.category.toLowerCase();
  const upgradeFeatures = getUpgradeFeatures();
  const currentPricing = pricing[currentPlanId] || {};
  const duration = subscriptionData.variation || 'month';

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white rounded-t-xl shadow-sm border border-gray-200">
          <div className="px-6 py-5 sm:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Your Subscription</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your plan, billing, and subscription settings
                </p>
              </div>
              <div className="hidden sm:block">
                <Link
                  to="/settings/change-plan"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Change Plan
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Status Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 sm:p-8 mt-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center">
                <Shield className="h-6 w-6 mr-2" />
                <h2 className="text-xl font-semibold">{subscriptionData.category} Plan</h2>
              </div>
              <p className="mt-2 text-blue-100">
                Next billing date: {formatDate(subscriptionData.next_renewal.unixtime)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{formatPrice(currentPricing[duration])}</p>
              <p className="text-blue-100">per {formatDuration(duration)}</p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Features</h3>
            <div className="space-y-3">
              {currentFeatures.filter(f => f.included).map((feature, index) => (
                <div key={index} className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>{renderFeatureText(feature.title)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Available Upgrades</h3>
              {currentPlanId === 'basic' && (
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setSelectedUpgradePlan('premium')}
                    className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                      selectedUpgradePlan === 'premium'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Premium
                  </button>
                  <button
                    onClick={() => setSelectedUpgradePlan('ultimate')}
                    className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                      selectedUpgradePlan === 'ultimate'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Ultimate
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {upgradeFeatures.map((feature, index) => (
                <div key={index} className="flex items-center text-gray-500">
                  <div className="h-5 w-5 border-2 border-gray-300 rounded-full mr-3 flex items-center justify-center">
                    <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                  </div>
                  <span>{renderFeatureText(feature.title)}</span>
                </div>
              ))}
              {upgradeFeatures.length === 0 && (
                <p className="text-gray-500 italic">You have access to all available features!</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="divide-y divide-gray-200">
            <Link
              to="/settings/payment-methods"
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Payment Methods</p>
                  <p className="text-sm text-gray-500">Update your payment information</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>

            <Link
              to="/settings/transactions"
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Billing History</p>
                  <p className="text-sm text-gray-500">View past transactions</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>

            <Link
              to="/settings/cancel"
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Cancel Subscription</p>
                  <p className="text-sm text-gray-500">End your subscription</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
