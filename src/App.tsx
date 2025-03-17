import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { ActivationPage } from './pages/ActivationPage';
import { ReactivatePage } from './pages/Settings/ReactivatePage';
import { Subscription } from './pages/Settings/Subscription';
import { PaymentMethods } from './pages/Settings/PaymentMethods';
import { PaymentHistory } from './pages/Settings/PaymentHistory';
import { ChangePlan } from './pages/Settings/ChangePlan';
import { ConfirmPlan } from './pages/Settings/ConfirmPlan';
import { CancelPlan } from './pages/Settings/CancelPlan';
import { CancelConfirmation } from './pages/Settings/CancelConfirmation';
import { CountryBanner } from './components/CountryBanner';
import { useCountry } from './hooks/useCountry';
import { useAuth } from './hooks/useAuth';
import { subscriptionApi } from './network/api';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    isActive: boolean;
    hasHistory: boolean;
  } | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkStatus = async () => {
      if (!isAuthenticated) return;

      try {
        const subscription = await subscriptionApi.getSubscription();
        const status = {
          isActive: subscription?.subscription?.is_active || false,
          hasHistory: subscription?.subscription?.subscription?.sku?.category && 
            subscription.subscription.subscription.sku.category !== 'Basic'
        };
        setSubscriptionStatus(status);
      } catch (error) {
        console.error('Error checking subscription status:', error);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkStatus();
  }, [isAuthenticated]);

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

function App() {
  const { isUS, loading } = useCountry();

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
        {!loading && !isUS && <CountryBanner />}
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route 
              path="/activate" 
              element={
                <ProtectedRoute>
                  <ActivationPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings/reactivate" 
              element={
                <ProtectedRoute>
                  <ReactivatePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings/subscription" 
              element={
                <ProtectedRoute>
                  <Subscription />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings/payment-methods" 
              element={
                <ProtectedRoute>
                  <PaymentMethods />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings/transactions" 
              element={
                <ProtectedRoute>
                  <PaymentHistory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings/change-plan" 
              element={
                <ProtectedRoute>
                  <ChangePlan />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings/change-plan/:planId" 
              element={
                <ProtectedRoute>
                  <ConfirmPlan />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings/cancel" 
              element={
                <ProtectedRoute>
                  <CancelPlan />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings/cancel-confirmation" 
              element={
                <ProtectedRoute>
                  <CancelConfirmation />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-center" />
      </div>
    </Router>
  );
}

export default App;