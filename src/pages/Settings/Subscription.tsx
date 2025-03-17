import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { subscriptionApi, SubscriptionResponse } from '../../network/api';
import { format } from 'date-fns';

export const Subscription = () => {
  const { user } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const data = await subscriptionApi.getSubscription();
        setSubscriptionData(data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const formatDate = (unixtime: number) => {
    return format(new Date(unixtime * 1000), 'MMM dd, yyyy');
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
            <p className="text-gray-600">Error loading subscription data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="bg-white rounded-lg shadow mb-6">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
            </div>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="space-y-6">
              {/* Plan Info */}
              <div className="bg-white rounded-lg p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Your Plan</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      <span className="text-green-600 font-semibold">{subscriptionData.subscription.category}</span>
                    </p>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-600">
                      Next charge: <span className="font-semibold">${subscriptionData.price}</span> on {formatDate(subscriptionData.subscription.next_renewal.unixtime)}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="grid md:grid-cols-2 gap-8 mt-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Current features:</h4>
                      <ul className="space-y-2">
                        {subscriptionData.userFeatures.unmasking && (
                          <li className="flex items-center text-sm text-gray-600">
                            <span className="text-green-500 mr-2">✓</span>
                            Unmask Blocked Calls
                          </li>
                        )}
                        {subscriptionData.userFeatures.blacklist && (
                          <li className="flex items-center text-sm text-gray-600">
                            <span className="text-green-500 mr-2">✓</span>
                            Block harassing callers
                          </li>
                        )}
                        {subscriptionData.userFeatures.missed_call_alerts && (
                          <li className="flex items-center text-sm text-gray-600">
                            <span className="text-green-500 mr-2">✓</span>
                            Missed call alerts
                          </li>
                        )}
                        {subscriptionData.userFeatures.cnam && (
                          <li className="flex items-center text-sm text-gray-600">
                            <span className="text-green-500 mr-2">✓</span>
                            Name & Address Caller ID
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Upgrade your plan to get:</h4>
                      <ul className="space-y-2">
                        {!subscriptionData.userFeatures.recording && (
                          <li className="flex items-center text-sm text-orange-600">
                            <span className="text-orange-500 mr-2">+</span>
                            Call Recording
                          </li>
                        )}
                        {!subscriptionData.userFeatures.transcriptions && (
                          <li className="flex items-center text-sm text-orange-600">
                            <span className="text-orange-500 mr-2">+</span>
                            Voicemail Transcriptions
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Actions */}
              <div className="bg-white rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg font-medium text-gray-900">Subscription Management</h3>
                </div>
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    <li>
                      <Link
                        to="/settings/payment-methods"
                        className="flex items-center justify-between px-4 py-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <span className="text-gray-600">Update Payment Method</span>
                        </div>
                        <span className="text-gray-400">→</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/settings/transactions"
                        className="flex items-center justify-between px-4 py-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <span className="text-gray-600">Payment History</span>
                        </div>
                        <span className="text-gray-400">→</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/settings/change-plan"
                        className="flex items-center justify-between px-4 py-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <span className="text-gray-600">Change Your Plan</span>
                        </div>
                        <span className="text-gray-400">→</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/settings/cancel"
                        className="flex items-center justify-between px-4 py-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <span className="text-gray-600">Cancel Your Plan</span>
                        </div>
                        <span className="text-gray-400">→</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}; 
