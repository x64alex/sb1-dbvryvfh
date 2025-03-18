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
    const fetchSubscriptionData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch subscription data
        const data = await subscriptionApi.getSubscription();
        if (!data) {
          throw new Error('No subscription data received');
        }
        setSubscriptionData(data);
        
        // Get current plan features and pricing
        const currentPlanId = data.category?.toLowerCase() || 'basic';
        
        // Fetch features for all plans
        const fetchFeatures = async () => {
          const features: Record<string, PlanFeature[]> = {};
          const pricingData: Record<string, any> = {};
          
          for (const planId of ['basic', 'premium', 'ultimate']) {
            try {
              const [planFeatures, planPricing] = await Promise.all([
                planApi.getPlanFeatures(planId),
                planApi.getPlanPricing(planId)
              ]);
              features[planId] = planFeatures;
              pricingData[planId] = planPricing;
            } catch (error) {
              console.error(`Error fetching ${planId} plan details:`, error);
            }
          }
          
          return { features, pricingData };
        };
        
        const { features, pricingData } = await fetchFeatures();
        
        setCurrentFeatures(features[currentPlanId] || []);
        setPremiumFeatures(features.premium || []);
        setUltimateFeatures(features.ultimate || []);
        setPricing(pricingData);
        
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        setError(error instanceof Error ? error.message : 'An error occurred while fetching subscription data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionData();
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error loading subscription data</div>
          <div className="text-gray-600">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!subscriptionData) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600">Invalid subscription data</div>
          <div className="text-sm text-gray-500 mt-2">Please contact support if this issue persists</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const currentPlanId = subscriptionData.category.toLowerCase();
  const upgradeFeatures = getUpgradeFeatures();
  const currentPricing = pricing[currentPlanId] || {};
  const duration = subscriptionData.variation || 'month';
  const nextRenewal = subscriptionData.next_renewal?.unixtime 
    ? formatDate(subscriptionData.next_renewal.unixtime)
    : 'Not available';

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white rounded-t-xl shadow-sm border border-gray-200">
          <div className="px-6 py-5 sm:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {currentPlanId.charAt(0).toUpperCase() + currentPlanId.slice(1)} Plan
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Billed {duration === 'month' ? 'monthly' : 'annually'} · Next renewal on {nextRenewal}
                </p>
              </div>
              {currentPlanId !== 'ultimate' && (
                <Link
                  to="/settings/upgrade"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Upgrade Plan
                  <ChevronRight className="ml-2 -mr-1 h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Plan Status Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 sm:p-8 mt-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center">
                <Shield className="h-6 w-6 mr-2" />
                <h2 className="text-xl font-semibold">{currentPlanId.charAt(0).toUpperCase() + currentPlanId.slice(1)} Plan</h2>
              </div>
              <p className="mt-2 text-blue-100">
                Next billing date: {nextRenewal}
              </p>
              {subscriptionData.userFeatures && Object.keys(subscriptionData.userFeatures).length > 0 && (
                <div className="mt-4 flex items-center text-sm text-blue-100">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>{Object.values(subscriptionData.userFeatures).filter(Boolean).length} features enabled</span>
                </div>
              )}
            </div>
            <div className="text-right">
              {currentPricing[duration] ? (
                <>
                  <p className="text-2xl font-bold">{formatPrice(currentPricing[duration])}</p>
                  <p className="text-blue-100">per {formatDuration(duration)}</p>
                </>
              ) : (
                <p className="text-lg">Contact support for pricing</p>
              )}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Features</h3>
            <div className="space-y-3">
              {currentFeatures.length > 0 ? (
                currentFeatures
                  .filter(f => f.included)
                  .map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>{renderFeatureText(feature.title)}</span>
                    </div>
                  ))
              ) : (
                <p className="text-gray-500">No features available for this plan</p>
              )}
            </div>
          </div>

          {currentPlanId !== 'ultimate' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Available in {selectedUpgradePlan.charAt(0).toUpperCase() + selectedUpgradePlan.slice(1)}
              </h3>
              <div className="space-y-3">
                {upgradeFeatures.length > 0 ? (
                  upgradeFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                      <span>{renderFeatureText(feature.title)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No additional features available</p>
                )}
              </div>
            </div>
          )}
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
