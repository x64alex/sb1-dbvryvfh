import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, setAuthToken, clearAuthToken, SignupRequest, VerifyCodeRequest, AuthResponse } from '../network/api';

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

    // Initialize auth state from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
            setAuthToken(storedToken);
        }
        setIsLoading(false);
    }, []);

    const handleAuthSuccess = useCallback((response: AuthResponse) => {
        if (response.token && response.user) {
            setToken(response.token);
            setUser(response.user);
            setIsAuthenticated(true);
            setAuthToken(response.token);
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            navigate('/settings/subscription');
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
