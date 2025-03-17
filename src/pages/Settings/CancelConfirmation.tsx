import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Phone, X, Mic, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { subscriptionApi, SubscriptionResponse } from '../../network/api';
import { format } from 'date-fns';

export const CancelConfirmation = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const data = await subscriptionApi.getSubscription();
        setSubscription(data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
        toast.error('Failed to load subscription details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const handleKeepSubscription = () => {
    toast.success('Thank you for staying with TrapCall!');
    navigate('/settings/subscription');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-red-600">Error loading subscription details</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (unixtime: number) => {
    return format(new Date(unixtime * 1000), 'MMM d, yyyy');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center">
            <Link 
              to="/settings/subscription"
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Cancel Subscription</h1>
          </div>

          <div className="p-6">
            <div className="text-center mb-8">
              <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                TrapCall stands guard
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                TrapCall now offers automatic spam call blocking on iPhone. You've received a number of spam calls since signing up for TrapCall, and we won't be able to block them for you if you cancel your service.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <Phone className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">
                    Protect yourself from masked callers
                  </h3>
                  <p className="text-sm text-gray-600">
                    Always know who's calling, even when they try to hide their number
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <X className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">
                    Automatic call blocking
                  </h3>
                  <p className="text-sm text-gray-600">
                    Block calls from over 100,000 spam numbers and your personal block list
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <Mic className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">
                    Call recording
                  </h3>
                  <p className="text-sm text-gray-600">
                    Record incoming calls and get the legal proof you need
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <Globe className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">
                    Caller identification
                  </h3>
                  <p className="text-sm text-gray-600">
                    Reveal full name & address of blocked callers
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <p className="text-lg font-medium mb-2">
                You're on our <span className="text-green-600">{subscription.subscription.category}</span> plan
              </p>
              <p className="text-gray-600">
                Your subscription renews on {formatDate(subscription.subscription.next_renewal.unixtime)}, for ${subscription.price}.
                If you cancel now, TrapCall will stop working immediately.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={handleKeepSubscription}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                OK, you convinced me
              </button>
              
              <Link
                to="/settings/cancel"
                className="w-full py-3 px-4 text-center text-red-600 border border-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
              >
                I still want to cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};