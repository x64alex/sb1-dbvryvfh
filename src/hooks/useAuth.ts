import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, setAuthToken, clearAuthToken, SignupRequest, VerifyCodeRequest, AuthResponse, subscriptionApi } from '../network/api';

interface AuthState {
    isAuthenticated: boolean;
    user: {
        phoneNumber: string;
        email: string;
    } | null;
    token: string | null;
}

export const useAuth = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<AuthState['user']>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkSubscription = async () => {
        try {
            const subscription = await subscriptionApi.getSubscription();
            return subscription.subscription.is_active;
        } catch (error) {
            console.error('Error checking subscription:', error);
            return false;
        }
    };

    // Initialize auth state from localStorage
    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            
            if (storedToken && storedUser) {
                setAuthToken(storedToken);
                const hasActiveSubscription = await checkSubscription();
                
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
                
                // Only redirect if we're on the login or signup pages
                const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/signup';
                if (isAuthPage) {
                    navigate(hasActiveSubscription ? '/settings/subscription' : '/activate');
                }
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, [navigate]);

    const handleAuthSuccess = useCallback(async (response: AuthResponse) => {
        if (response.token && response.user) {
            setToken(response.token);
            setUser(response.user);
            setIsAuthenticated(true);
            setAuthToken(response.token);
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            // Check subscription status after successful auth
            const hasActiveSubscription = await checkSubscription();
            navigate(hasActiveSubscription ? '/settings/subscription' : '/activate');
        }
    }, [navigate]);

    const signup = useCallback(async (data: SignupRequest) => {
        const response = await authApi.signup(data);
        return response;
    }, []);

    const verifySignup = useCallback(async (data: VerifyCodeRequest) => {
        const response = await authApi.verifySignup(data);
        handleAuthSuccess(response);
        return response;
    }, [handleAuthSuccess]);

    const login = useCallback(async (phoneNumber: string) => {
        const response = await authApi.login(phoneNumber);
        return response;
    }, []);

    const verifyLogin = useCallback(async (data: VerifyCodeRequest) => {
        const response = await authApi.verifyLogin(data);
        handleAuthSuccess(response);
        return response;
    }, [handleAuthSuccess]);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        clearAuthToken();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    }, [navigate]);

    return {
        isAuthenticated,
        user,
        token,
        isLoading,
        signup,
        verifySignup,
        login,
        verifyLogin,
        logout,
    };
};