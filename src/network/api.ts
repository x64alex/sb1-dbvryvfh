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
};

// Add auth token to requests
export const setAuthToken = (token: string) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const clearAuthToken = () => {
    delete api.defaults.headers.common['Authorization'];
};

export default api;
