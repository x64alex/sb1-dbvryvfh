import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { planApi, Plan, subscriptionApi, PlanFeature } from '../../network/api';

export const ChangePlan = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string>('');
  const [planFeatures, setPlanFeatures] = useState<Record<string, PlanFeature[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansData, subscriptionData] = await Promise.all([
          planApi.getPlans(),
          subscriptionApi.getSubscription()
        ]);
        setPlans(plansData);
        const currentPlanId = subscriptionData.subscription.category.toLowerCase();
        setCurrentPlan(currentPlanId);

        // Fetch features for all plans
        const featuresPromises = plansData.map(plan => 
          planApi.getPlanFeatures(plan.id)
        );
        const allFeatures = await Promise.all(featuresPromises);
        const featuresMap: Record<string, PlanFeature[]> = {};
        plansData.forEach((plan, index) => {
          featuresMap[plan.id] = allFeatures[index];
        });
        setPlanFeatures(featuresMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChangePlan = (planId: string) => {
    if (planId !== currentPlan) {
      navigate(`/settings/change-plan/${planId}`);
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
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to="/settings/subscription"
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Change your TrapCall subscription</h1>
          </div>
          <p className="text-gray-600 mb-8">You're currently subscribed to our {currentPlan} plan. You can change your subscription below.</p>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrentPlan = plan.id === currentPlan;
              const planColors = {
                basic: {
                  border: 'border-green-600',
                  button: 'bg-green-600 hover:bg-green-700',
                  check: 'text-green-600'
                },
                premium: {
                  border: 'border-blue-600',
                  button: 'bg-blue-600 hover:bg-blue-700',
                  check: 'text-blue-600'
                },
                ultimate: {
                  border: 'border-orange-500',
                  button: 'bg-orange-500 hover:bg-orange-600',
                  check: 'text-orange-500'
                }
              };
              const colors = planColors[plan.id as keyof typeof planColors];
              const features = planFeatures[plan.id] || [];

              return (
                <div 
                  key={plan.id}
                  className={`bg-white rounded-lg border ${isCurrentPlan ? colors.border : 'border-gray-200'}`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold">{plan.name}</h2>
                      {isCurrentPlan && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-800">
                          Current Plan
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mt-2">
                      {plan.id === 'basic' && 'Affordable protection from blocked calls'}
                      {plan.id === 'premium' && 'Our comprehensive anti-harassment plan'}
                      {plan.id === 'ultimate' && 'Full service protection & recording for legal proof'}
                    </p>

                    <button
                      onClick={() => handleChangePlan(plan.id)}
                      className={`w-full py-2.5 px-4 rounded-lg text-center text-white font-medium transition-colors mt-4 ${
                        isCurrentPlan 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : colors.button
                      }`}
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
                    </button>

                    <div className="mt-6">
                      <div className="space-y-3">
                        {features.filter(f => f.included).map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className={`h-5 w-5 ${colors.check}`} />
                            <span className="text-gray-700">{renderFeatureText(feature.title)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/settings/cancel"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel your subscription
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};