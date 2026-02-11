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

// Request interceptor to mark silent requests
apiClient.interceptors.request.use((config) => {
  // Mark silent session checks to suppress console errors
  if (config.skipAuthInterceptor) {
    // Add custom header that some devtools respect
    config.headers['X-Silent-Request'] = 'true';
  }
  return config;
});

// Response interceptor for handling 401 (session expired)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Skip interceptor if this is a silent session check
    if (error.config?.skipAuthInterceptor) {
      return Promise.reject(error);
    }
    
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
    
    // Clear logout flag on successful login
    localStorage.removeItem('AIDD_LOGGED_OUT');
    
    return response.data;
  },

  logout: async (): Promise<void> => {
    // Set logout flag to prevent immediate redirect on refresh
    localStorage.setItem('AIDD_LOGGED_OUT', 'true');
    
    await apiClient.post('/api/auth/logout');
    
    // Clear localStorage token
    localStorage.removeItem('AIDD_SESSION_TOKEN');
  },

  validateSession: async (): Promise<{ success: boolean; data?: { userId: number; username: string; expiresAt: string; isValid: boolean } }> => {
    // Check if user explicitly logged out - if so, don't validate session
    const loggedOut = localStorage.getItem('AIDD_LOGGED_OUT');
    if (loggedOut === 'true') {
      console.log('[authService] User explicitly logged out, skipping session validation');
      localStorage.removeItem('AIDD_SESSION_TOKEN');
      return { success: false };
    }
    
    // WORKAROUND: In development, Vite proxy doesn't forward httpOnly cookies reliably on page reload
    // Try localStorage token first if available (set during login)
    const token = localStorage.getItem('AIDD_SESSION_TOKEN');
    
    if (token) {
      console.log('[authService] Found localStorage token, validating with Bearer token');
      try {
        const response = await apiClient.get('/api/auth/session', {
          headers: { 'Authorization': `Bearer ${token}` },
          validateStatus: (status) => status < 500,
          skipAuthInterceptor: true,
        } as any);
        
        console.log('[authService] Token validation response status:', response.status);
        console.log('[authService] Token validation response data:', response.data);
        
        if (response.status === 401) {
          console.log('[authService] Token validation failed with 401, clearing token');
          localStorage.removeItem('AIDD_SESSION_TOKEN');
          return { success: false };
        }
        
        console.log('[authService] Token validation successful');
        return response.data;
      } catch (tokenError: any) {
        console.log('[authService] Token validation error:', tokenError);
        localStorage.removeItem('AIDD_SESSION_TOKEN');
        // Fall through to try cookie
      }
    }
    
    // Try with cookie (production - should work in deployed environment)
    try {
      console.log('[authService] No localStorage token or token failed, trying cookie');
      const response = await apiClient.get('/api/auth/session', {
        validateStatus: (status) => status < 500, // Don't throw for client errors (4xx)
        skipAuthInterceptor: true, // Skip 401 interceptor for silent session checks
      } as any);
      
      console.log('[authService] Cookie validation response status:', response.status);
      console.log('[authService] Cookie validation response data:', response.data);
      
      if (response.status === 401) {
        console.log('[authService] Cookie validation returned 401');
        return { success: false };
      }
      
      console.log('[authService] Cookie validation successful');
      return response.data;
    } catch (error: any) {
      console.log('[authService] Cookie validation error:', error);
      return { success: false };
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
