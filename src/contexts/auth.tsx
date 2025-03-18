import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  checkStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  const checkStatus = async () => {
    if (!isAuthenticated) {
      setIsCheckingStatus(false);
      return;
    }

    try {
      setIsCheckingStatus(true);
      const subscription = await subscriptionApi.getSubscription();
      console.log('Subscription response:', subscription);
      const hasHistory = subscription?.next_renewal !== null;
      
      setSubscriptionStatus({
        isActive: subscription?.is_active || false,
        hasHistory: Boolean(hasHistory)
      });
    } catch (error) {
      console.error('Error checking subscription status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ subscriptionStatus, isCheckingStatus, checkStatus }}>
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
  const { subscriptionStatus, isCheckingStatus, checkStatus } = useAuthContext();

  useEffect(() => {
    if (isAuthenticated && !isCheckingStatus) {
      checkStatus();
    }
  }, []);

  if (isLoading || isCheckingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  console.log('ProtectedRoute', subscriptionStatus);
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If no subscription status exists, redirect to activate
  if (!subscriptionStatus) {
    return <Navigate to="/activate" />;
  }

  // If subscription is not active and has history, redirect to reactivate
  if (!subscriptionStatus.isActive && subscriptionStatus.hasHistory) {
    console.log('Redirecting to reactivate');
    return <Navigate to="/settings/reactivate" />;
  }

  // If subscription is not active and no history, redirect to activate
  if (!subscriptionStatus.isActive && !subscriptionStatus.hasHistory) {
    return <Navigate to="/activate" />;
  }

  // If subscription is active, allow access to requested page
  return <>{children}</>;
}; 
