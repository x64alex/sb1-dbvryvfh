import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { subscriptionApi } from '../network/api';
import { useAuth } from '../hooks/useAuth';

interface SubscriptionStatus {
  isActive: boolean;
  hasHistory: boolean;
}

interface AuthContextType {
  subscriptionStatus: SubscriptionStatus | null;
  isCheckingStatus: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      if (!isAuthenticated) {
        setIsCheckingStatus(false);
        return;
      }

      try {
        const subscription = await subscriptionApi.getSubscription();
        const hasHistory = subscription?.subscription?.subscription?.sku?.category !== 'Basic';
        
        setSubscriptionStatus({
          isActive: subscription?.subscription?.is_active || false,
          hasHistory: Boolean(hasHistory)
        });
      } catch (error) {
        console.error('Error checking subscription status:', error);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkStatus();
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ subscriptionStatus, isCheckingStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { subscriptionStatus, isCheckingStatus } = useAuthContext();
  const location = useLocation();

  if (isLoading || isCheckingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If we have subscription status and user is trying to access a protected route
  if (subscriptionStatus) {
    const currentPath = location.pathname;
    const isSettingsPage = currentPath.startsWith('/settings');
    const isActivationPage = currentPath === '/activate';
    const isReactivationPage = currentPath === '/settings/reactivate';

    // Redirect logic based on subscription status
    if (subscriptionStatus.isActive && (isActivationPage || isReactivationPage)) {
      return <Navigate to="/settings/subscription" />;
    }

    if (!subscriptionStatus.isActive) {
      if (subscriptionStatus.hasHistory && !isReactivationPage) {
        return <Navigate to="/settings/reactivate" />;
      }
      if (!subscriptionStatus.hasHistory && !isActivationPage) {
        return <Navigate to="/activate" />;
      }
    }

    // Prevent access to settings pages if subscription is not active
    if (!subscriptionStatus.isActive && isSettingsPage && !isReactivationPage) {
      return subscriptionStatus.hasHistory ? 
        <Navigate to="/settings/reactivate" /> : 
        <Navigate to="/activate" />;
    }
  }

  return <>{children}</>;
}; 
