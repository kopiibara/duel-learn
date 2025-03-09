import { useState } from 'react';
import { auth } from '../../services/firebase';

interface StoreUserData {
  username: string;
  email: string;
  password: string;
  account_type: "free" | "premium" | "admin";
}

interface StoreUserResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const useStoreUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storeUser = async (userData: StoreUserData, token: string): Promise<StoreUserResponse> => {
    setIsLoading(true);
    setError(null);
    console.log("=== Starting storeUser request ===");
    console.log("Base URL:", import.meta.env.VITE_BACKEND_URL);

    try {
      const firebase_uid = auth.currentUser?.uid;
      console.log("Current user UID:", firebase_uid);
      
      if (!firebase_uid) {
        throw new Error('No user ID found');
      }

      const url = `${import.meta.env.VITE_BACKEND_URL}/api/user/store-user/${firebase_uid}`;
      console.log("Request URL:", url);
      console.log("Request headers:", {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.substring(0, 10)}...`
      });
      console.log("Request body:", { ...userData, password: '***' });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to store user data');
      }

      console.log("Store user successful");
      return {
        success: true,
        message: data.message || 'User stored successfully'
      };

    } catch (err) {
      console.error("Store user error:", err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
      console.log("=== End storeUser request ===");
    }
  };

  return {
    storeUser,
    isLoading,
    error
  };
}; 