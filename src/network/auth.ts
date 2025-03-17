import api from './api';
import { SignupRequest, VerifyCodeRequest, AuthResponse, ResendCodeRequest, ResendCodeResponse } from './types';

export const authApi = {
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/signup', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('An error occurred during signup. Please try again.');
    }
  },

  verifySignup: async (data: VerifyCodeRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/verify-signup', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('An error occurred during verification. Please try again.');
    }
  },

  login: async (phoneNumber: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/login', { phoneNumber });
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('An error occurred during login. Please try again.');
    }
  },

  verifyLogin: async (data: VerifyCodeRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/verify-login', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('An error occurred during verification. Please try again.');
    }
  },

  resendCode: async (data: ResendCodeRequest): Promise<ResendCodeResponse> => {
    try {
      const response = await api.post<ResendCodeResponse>('/resend-code', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('An error occurred while resending the code. Please try again.');
    }
  }
};