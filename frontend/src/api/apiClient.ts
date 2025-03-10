import axios, { AxiosResponse, AxiosError } from 'axios';
import { auth } from '../services/firebase';

// Type definition for response with message
interface ApiResponse {
  success?: boolean;
  message?: string;
  severity?: 'error' | 'warning' | 'info' | 'success';
  [key: string]: any;
}

// Create this as a singleton that can be imported where needed
type SnackbarFunction = (message: string, severity?: 'error' | 'warning' | 'info' | 'success') => void;
let showSnackbarFunction: SnackbarFunction | null = null;

export const setSnackbarFunction = (fn: SnackbarFunction) => {
  showSnackbarFunction = fn;
};

// Create the API client
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Try to get current Firebase user token
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken(true);
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`Adding token to ${config.url} request (first 10 chars): ${token.substring(0, 10)}...`);
      } else {
        console.warn('No current user found for authentication');
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle middleware messages
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // If response has a message, show it in the snackbar
    if (response.data?.message && showSnackbarFunction) {
      showSnackbarFunction(
        response.data.message,
        response.data.severity || 'info'
      );
    }
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    // Handle error responses
    let message = 'An error occurred';
    let severity: 'error' | 'warning' = 'error';
    
    console.log('API Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    });
    
    if (error.response?.data) {
      if (error.response.data.message) {
        message = error.response.data.message;
      }
      if (error.response.data.severity) {
        severity = error.response.data.severity as 'error' | 'warning';
      }
    }
    
    // Special case for network errors
    if (error.code === 'ERR_NETWORK') {
      message = 'Network error. Please check your connection.';
    }
    
    // Special case for timeout
    if (error.code === 'ECONNABORTED') {
      message = 'Request timed out. Please try again.';
    }
    
    // Special case for 401 Unauthorized
    if (error.response?.status === 401) {
      message = 'Authentication required. Please make sure you are logged in.';
    }
    
    // Special case for 403 Forbidden
    if (error.response?.status === 403) {
      message = 'You do not have permission to access this resource. Admin privileges required.';
      
      // Log details about the current user for debugging
      const currentUser = auth.currentUser;
      console.log('403 Forbidden Error - Current user:', currentUser?.email);
      console.log('403 Forbidden Error - User UID:', currentUser?.uid);
      console.log('403 Forbidden Error - Request URL:', error.config?.url);
    }
    
    // Display the error message
    if (showSnackbarFunction) {
      showSnackbarFunction(message, severity);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 