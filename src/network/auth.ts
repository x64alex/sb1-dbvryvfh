import api from './api';
import { LoginRequest, SignUpRequest, ForgotPinRequest, ApiResponse, AuthResponse } from './types';

export const login = async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
  try {
    const response = await api.post<ApiResponse<AuthResponse>>('/login', data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('An error occurred during login. Please try again.');
  }
};

export const signUp = async (data: SignUpRequest): Promise<ApiResponse<AuthResponse>> => {
  try {
    const response = await api.post<ApiResponse<AuthResponse>>('/sign-up', data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('An error occurred during sign up. Please try again.');
  }
};

export const forgotPin = async (data: ForgotPinRequest): Promise<ApiResponse<void>> => {
  try {
    const response = await api.post<ApiResponse<void>>('/forgot', data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('An error occurred while requesting PIN reset. Please try again.');
  }
};