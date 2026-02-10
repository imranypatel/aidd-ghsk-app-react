import axios from 'axios';
import type { LoginCredentials } from '../types/LoginCredentials';
import type { LoginResponse } from '../types/LoginResponse';
import type { User } from '../types/User';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''; // Empty string uses Vite proxy for /api routes

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for handling 401 (session expired)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expired - clear any stale auth state
      // AuthContext will handle redirect via checkSession
      window.dispatchEvent(new CustomEvent('session-expired'));
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials);
    
    // WORKAROUND: Store session token in localStorage for E2E tests
    // In production, cookies work properly. This is only needed for dev/test environments
    // where Vite proxy doesn't forward httpOnly cookies correctly
    if (response.data.success && response.data.data?.session?.token) {
      localStorage.setItem('AIDD_SESSION_TOKEN', response.data.data.session.token);
    }
    
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
    
    // Clear localStorage token
    localStorage.removeItem('AIDD_SESSION_TOKEN');
  },

  validateSession: async (): Promise<{ success: boolean; data?: { userId: number; username: string; expiresAt: string; isValid: boolean } }> => {
    try {
      // Try with cookie first (production)
      const response = await apiClient.get('/api/auth/session');
      return response.data;
    } catch (error: any) {
      // WORKAROUND: Fallback to localStorage token for E2E tests
      // In production, cookies work properly via reverse proxy
      const token = localStorage.getItem('AIDD_SESSION_TOKEN');
      if (token) {
        try {
          const response = await apiClient.get('/api/auth/session', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          return response.data;
        } catch (tokenError: any) {
          // Token invalid - clear it
          localStorage.removeItem('AIDD_SESSION_TOKEN');
          throw tokenError;
        }
      }
      
      throw error;
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const sessionResponse = await apiClient.get('/api/auth/session');
      if (sessionResponse.data.success) {
        // Note: The session endpoint doesn't return user details yet
        // This would need to be enhanced or we'd need a separate endpoint
        return null;
      }
      return null;
    } catch {
      return null;
    }
  },
};
