import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, setAuthToken, clearAuthToken, SignupRequest, VerifyCodeRequest, AuthResponse, subscriptionApi } from '../network/api';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    phoneNumber: string;
    email: string;
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
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setAuthToken(storedToken);
        
        setState({
          isAuthenticated: true,
          isLoading: false,
          token: storedToken,
          user: JSON.parse(storedUser)
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, [navigate]);

  const handleAuthSuccess = useCallback(async (response: AuthResponse) => {
    if (response.token && response.user) {
      console.log('handleAuthSuccess');
      const newState = {
        isAuthenticated: true,
        isLoading: false,
        token: response.token,
        user: response.user
      };
      
      setState(newState);
      setAuthToken(response.token);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      navigate('/settings/subscription');

    }
  }, [navigate]);

  const signup = useCallback(async (data: SignupRequest) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await authApi.signup(data);
      return response;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const verifySignup = useCallback(async (data: VerifyCodeRequest) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await authApi.verifySignup(data);
      await handleAuthSuccess(response);
      return response;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [handleAuthSuccess]);

  const login = useCallback(async (phoneNumber: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await authApi.login(phoneNumber);
      return response;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const verifyLogin = useCallback(async (data: VerifyCodeRequest) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await authApi.verifyLogin(data);
      await handleAuthSuccess(response);
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
