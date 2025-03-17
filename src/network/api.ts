import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface SignupRequest {
    email: string;
    phoneNumber: string;
}

export interface VerifyCodeRequest {
    phoneNumber: string;
    code: string;
}

export interface AuthResponse {
    message: string;
    token?: string;
    phoneNumber?: string;
    user?: {
        phoneNumber: string;
        email: string;
    };
}

export interface ResendCodeRequest {
    phoneNumber: string;
    type: 'signup' | 'login';
}

export interface ResendCodeResponse {
    message: string;
    phoneNumber: string;
    remainingTime?: number;
}

export interface SubscriptionResponse {
    subscription: {
        is_active: boolean;
        category: string;
        next_renewal: {
            unixtime: number;
        };
        subscription: {
            sku: {
                category: string;
                variation: string;
            };
        };
    };
    userFeatures: {
        unmasking: boolean;
        blacklist: boolean;
        missed_call_alerts: boolean;
        cnam: boolean;
        transcriptions: boolean;
        recording: boolean;
    };
    price: string;
}

export const authApi = {
    signup: async (data: SignupRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/signup', data);
        return response.data;
    },

    verifySignup: async (data: VerifyCodeRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/verify-signup', data);
        return response.data;
    },

    login: async (phoneNumber: string): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/login', { phoneNumber });
        return response.data;
    },

    verifyLogin: async (data: VerifyCodeRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/verify-login', data);
        return response.data;
    },

    resendCode: async (data: ResendCodeRequest): Promise<ResendCodeResponse> => {
        const response = await api.post<ResendCodeResponse>('/resend-code', data);
        return response.data;
    },
};

export const subscriptionApi = {
    getSubscription: async (): Promise<SubscriptionResponse> => {
        const response = await api.get<SubscriptionResponse>('/subscription');
        return response.data;
    },
};

// Add auth token to requests
export const setAuthToken = (token: string) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const clearAuthToken = () => {
    delete api.defaults.headers.common['Authorization'];
};

export default api;
