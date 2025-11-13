import apiClient from './apiClient';
import type { LoginCredentials, LoginResponse, RegistrationData, RegistrationResponse } from '../types';

export const login = (credentials: LoginCredentials): Promise<LoginResponse> => {
  return apiClient.post('/users/login', credentials);
};

export const register = (data: RegistrationData): Promise<RegistrationResponse> => {
  return apiClient.post('/users/register', data);
};
