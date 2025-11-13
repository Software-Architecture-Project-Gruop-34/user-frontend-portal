import apiClient from './apiClient';
import type { LoginCredentials, LoginResponse } from '../types';

export const login = (credentials: LoginCredentials): Promise<LoginResponse> => {
  return apiClient.post('/users/login', credentials);
};
