import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export const CancelPlan = () => {
  const navigate = useNavigate();
  const [reason, setReason] = useState('');

  const reasons = [
    'Did not stop unwanted calls',
    'Didn\'t know how to use',
    'My carrier is not supported',
    'I wasn\'t satisfied with customer service',
    'Problems with voicemail',
    'TrapCall is too expensive',
    'Problems with unmasking',
    'Problems with setup',
    'I caught the caller'
  ];

  const handleContinueCancel = () => {
    if (!reason) {
      return;
    }
    navigate('/settings/cancel-confirmation', { state: { reason } });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:px-6 flex items-center">
            <Link 
              to="/settings/subscription"
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Cancel Your Plan</h1>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Warning: Cancellation has immediate effects
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      If you cancel your subscription:
                    </p>
                    <ul className="list-disc list-inside mt-2">
                      <li>Your service will stop immediately</li>
                      <li>You'll lose access to all premium features</li>
                      <li>Blocked numbers will be able to reach you again</li>
                      <li>Your recorded calls will be deleted</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please tell us why you're leaving
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a reason</option>
                  {reasons.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-4">
                <Link
                  to="/settings/change-plan"
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                >
                  Change Plan Instead
                </Link>
                
                <button
                  onClick={handleContinueCancel}
                  disabled={!reason}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    reason 
                      ? 'text-red-600 border border-red-600 hover:bg-red-50'
                      : 'text-gray-400 border border-gray-300 cursor-not-allowed'
                  }`}
                >
                  Continue with Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};