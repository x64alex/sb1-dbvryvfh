import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.message === 'Network Error') {
      console.error('Network error - make sure API is running');
    }
    return Promise.reject(error);
  }
);

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

export interface Card {
    id: number;
    last4: string;
    brand: string;
    expMonth: number;
    expYear: number;
    isDefault: boolean;
}

export interface Transaction {
    id: number;
    date: Date;
    amount: number;
    status: string;
    description: string;
}

export interface PlanFeature {
    title: string;
    description: string;
    included: boolean;
}

export interface Plan {
    id: string;
    name: string;
    color: string;
    current?: boolean;
    features: Array<{
        title: string;
        description: string;
    }>;
}

export interface PlanDuration {
    id: string;
    label: string;
    price: string;
    savings?: string;
}

export interface ChangePlanRequest {
    planId: string;
    duration: string;
}

export interface SubscriptionResponse {
    is_active: boolean;
    category: string;
    variation: string;
    next_renewal: {
        unixtime: number;
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

export interface PlanPricing {
  month: number;
  year: number;
  two_years: number;
}

export interface SetupIntentResponse {
    clientSecret: string;
}

export interface PaymentMethod {
    id: string;
    last4: string;
    brand: string;
    exp_month: number;
    exp_year: number;
}

export interface ConfirmSetupIntentRequest {
    clientSecret: string;
    paymentMethod: PaymentMethod;
}

export interface ConfirmSetupIntentResponse {
    setupIntent: {
        id: string;
        status: string;
    };
    card: Card;
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

export const paymentApi = {
    getCards: async (): Promise<Card[]> => {
        const response = await api.get<Card[]>('/payment-methods');
        return response.data;
    },

    getTransactions: async (): Promise<Transaction[]> => {
        const response = await api.get<Transaction[]>('/transactions');
        return response.data;
    },

    createSetupIntent: async (): Promise<SetupIntentResponse> => {
        const response = await api.post<SetupIntentResponse>('/setup-intent');
        return response.data;
    },

    confirmSetupIntent: async (data: ConfirmSetupIntentRequest): Promise<ConfirmSetupIntentResponse> => {
        const response = await api.post<ConfirmSetupIntentResponse>('/confirm-setup-intent', data);
        return response.data;
    },

    setDefaultPaymentMethod: async (cardId: number): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>(`/payment-methods/${cardId}/default`);
        return response.data;
    },

    deletePaymentMethod: async (cardId: number): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`/payment-methods/${cardId}`);
        return response.data;
    }
};

export const planApi = {
    getPlans: async (): Promise<Plan[]> => {
        const response = await api.get<Plan[]>('/plans');
        return response.data;
    },

    getPlanFeatures: async (planId: string): Promise<PlanFeature[]> => {
        const response = await api.get<PlanFeature[]>(`/plans/${planId}/features`);
        return response.data;
    },

    getPlanPricing: async (planId: string): Promise<PlanPricing> => {
        const response = await api.get(`/plans/${planId}/pricing`);
        return response.data;
    },

    changePlan: async (data: ChangePlanRequest): Promise<{ message: string }> => {
        const response = await api.post('/change-plan', data);
        return response.data;
    }
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
