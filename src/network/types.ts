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

export interface ApiError {
  message: string;
  code?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
}