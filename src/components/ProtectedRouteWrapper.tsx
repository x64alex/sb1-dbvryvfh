import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

interface ProtectedRouteWrapperProps {
  children: React.ReactNode;
}

export const ProtectedRouteWrapper = ({ children }: ProtectedRouteWrapperProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.hasSubscription) {
    return <Navigate to="/activate" replace />;
  }

  if (!user?.activeSubscription?.is_active && user?.activeSubscription?.next_renewal) {
    return <Navigate to="/settings/reactivate" replace />;
  }

  return <>{children}</>;
}; 
