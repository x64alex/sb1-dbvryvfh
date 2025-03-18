import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, setAuthToken, clearAuthToken, SignupRequest, VerifyCodeRequest, AuthResponse, SubscriptionResponse } from '../network/api';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    phoneNumber: string;
    email: string;
    hasSubscription: boolean;
    activeSubscription: SubscriptionResponse | null;
  } | null;
  token: string | null;
}

export const useAuth = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    token: null
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setAuthToken(storedToken);
      const parsedUser = JSON.parse(storedUser);
      setState({
        isAuthenticated: true,
        isLoading: false,
        token: storedToken,
        user: parsedUser
      });
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const handleAuthSuccess = useCallback((response: AuthResponse) => {
    if (response.token && response.user) {
      setState({
        isAuthenticated: true,
        isLoading: false,
        token: response.token,
        user: response.user
      });
      
      setAuthToken(response.token);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Navigate based on subscription status
      if (!response.user.hasSubscription) {
        navigate('/activate');
      } else if (!response.user.activeSubscription?.is_active && response.user.activeSubscription?.next_renewal) {
        navigate('/settings/reactivate');
      } else {
        navigate('/settings/subscription');
      }
    }
  }, [navigate]);

  const signup = useCallback(async (data: SignupRequest) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      return await authApi.signup(data);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const verifySignup = useCallback(async (data: VerifyCodeRequest) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await authApi.verifySignup(data);
      handleAuthSuccess(response);
      return response;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [handleAuthSuccess]);

  const login = useCallback(async (phoneNumber: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      return await authApi.login(phoneNumber);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const verifyLogin = useCallback(async (data: VerifyCodeRequest) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await authApi.verifyLogin(data);
      handleAuthSuccess(response);
      return response;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [handleAuthSuccess]);

  const logout = useCallback(() => {
    setState({
      isAuthenticated: false,
      isLoading: false,
      token: null,
      user: null
    });
    clearAuthToken();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }, [navigate]);

  return {
    ...state,
    signup,
    verifySignup,
    login,
    verifyLogin,
    logout
  };
};
