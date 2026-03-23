import apiClient from '../axios';

export interface LoginRequest {
  userIdentifier: string;
  appCode: string;
}

export interface LoginResponse {
  success: boolean;
  user: {
    id: string;
    userIdentifier: string;
    name: string;
    email: string;
  };
  token: string;
  message: string;
}

export const authAPI = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },
};