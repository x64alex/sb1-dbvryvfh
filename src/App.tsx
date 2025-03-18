import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { ProtectedRouteWrapper } from './components/ProtectedRouteWrapper';

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
            <Route path="/activate" element={<ActivationPage />} />
            <Route path="/settings/reactivate" element={<ReactivatePage />} />
            <Route 
              path="/settings/subscription" 
              element={
                <ProtectedRouteWrapper>
                  <Subscription />
                </ProtectedRouteWrapper>
              } 
            />
            <Route 
              path="/settings/payment-methods" 
              element={
                <ProtectedRouteWrapper>
                  <PaymentMethods />
                </ProtectedRouteWrapper>
              } 
            />
            <Route 
              path="/settings/transactions" 
              element={
                <ProtectedRouteWrapper>
                  <PaymentHistory />
                </ProtectedRouteWrapper>
              } 
            />
            <Route 
              path="/settings/change-plan" 
              element={
                <ProtectedRouteWrapper>
                  <ChangePlan />
                </ProtectedRouteWrapper>
              } 
            />
            <Route 
              path="/settings/change-plan/:planId" 
              element={
                <ProtectedRouteWrapper>
                  <ConfirmPlan />
                </ProtectedRouteWrapper>
              } 
            />
            <Route 
              path="/settings/cancel" 
              element={
                <ProtectedRouteWrapper>
                  <CancelPlan />
                </ProtectedRouteWrapper>
              } 
            />
            <Route 
              path="/settings/cancel-confirmation" 
              element={
                <ProtectedRouteWrapper>
                  <CancelConfirmation />
                </ProtectedRouteWrapper>
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
