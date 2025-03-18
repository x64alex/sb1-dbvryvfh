import React, { createContext, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { subscriptionApi, SubscriptionResponse } from '../network/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    phoneNumber: string;
    email: string;
  } | null;
  subscription: SubscriptionResponse | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (isAuthenticated) {
        try {
          const data = await subscriptionApi.getSubscription();
          setSubscription(data);
        } catch (error) {
          console.error('Error fetching subscription:', error);
        }
      }
    };

    fetchSubscription();
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, subscription }}>
      {children}
    </AuthContext.Provider>
  );
};

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, subscription } = useAuthContext();
  const location = useLocation();

  useEffect(() => {
    console.log('subscription', subscription);
    if (isAuthenticated) {
      if(!subscription){
        window.location.href = '/activate';
      }
      else if (!subscription.is_active) {
          window.location.href = '/settings/reactivate';
      }
    }
  }, [subscription]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}; 
