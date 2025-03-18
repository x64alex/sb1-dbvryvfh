import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, setAuthToken, clearAuthToken } from '../network/api';
import { AuthResponse, SubscriptionResponse, SignupRequest, VerifyCodeRequest } from '../network/types';

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

interface AuthContextType extends AuthState {
  signup: (data: SignupRequest) => Promise<AuthResponse>;
  verifySignup: (data: VerifyCodeRequest) => Promise<AuthResponse>;
  login: (phoneNumber: string) => Promise<AuthResponse>;
  verifyLogin: (data: VerifyCodeRequest) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
      const parsedUser = JSON.parse(storedUser);
      setState({
        isAuthenticated: true,
        isLoading: false,
        token: storedToken,
        user: parsedUser
      });
      setAuthToken(storedToken);
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
      clearAuthToken();
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

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setAuthToken(response.token);

      if (!response.user.hasSubscription) {
        navigate('/activate');
      } else {
        navigate('/settings/subscription');
      }
    }
  }, [navigate]);

  const signup = async (data: SignupRequest) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      return await authApi.signup(data);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const verifySignup = async (data: VerifyCodeRequest) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await authApi.verifySignup(data);
      handleAuthSuccess(response);
      return response;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (phoneNumber: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      return await authApi.login(phoneNumber);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const verifyLogin = async (data: VerifyCodeRequest) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await authApi.verifyLogin(data);
      handleAuthSuccess(response);
      return response;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const logout = () => {
    setState({
      isAuthenticated: false,
      isLoading: false,
      token: null,
      user: null
    });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    clearAuthToken();
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ ...state, signup, verifySignup, login, verifyLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}; 
