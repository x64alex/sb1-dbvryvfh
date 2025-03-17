export interface LoginRequest {
  phone: string;
}

export interface SignUpRequest {
  phone: string;
  pin: string;
  email: string;
}


export interface ApiError {
  message: string;
  code?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    phone: string;
    email: string;
  };
}
