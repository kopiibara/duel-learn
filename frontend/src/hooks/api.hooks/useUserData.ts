import { useState } from 'react';
import { useUser } from '../../contexts/UserContext';

interface User {
  firebase_uid: string;
  username: string | null;
  email: string | null;
  display_picture: string | null;
  full_name: string | null;
  email_verified: boolean;
  isSSO: boolean;
  account_type: "free" | "premium" | "admin";
  isNew: boolean;
  level: number;
  exp: number;
  mana: number;
  coins: number;
}

const useUserData = () => {
  const { setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAndUpdateUserData = async (firebase_uid: string, token: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/info/${firebase_uid}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user data');
      }

      const { user: userData } = await response.json();

      // Create user object matching the User interface
      const user: User = {
        firebase_uid: userData.firebase_uid,
        username: userData.username,
        email: userData.email,
        display_picture: userData.display_picture,
        full_name: userData.full_name || null,
        email_verified: userData.email_verified,
        isSSO: userData.isSSO,
        account_type: userData.account_type || 'free',
        isNew: userData.isNew || false,
        level: userData.level || 1,
        exp: userData.exp || 0,
        mana: userData.mana || 200,
        coins: userData.coins || 500,
      };

      // Update context
      setUser(user);

      // Update localStorage and sessionStorage
      localStorage.setItem('userData', JSON.stringify(user));
      sessionStorage.setItem('userData', JSON.stringify(user));

      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching user data';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchAndUpdateUserData,
    loading,
    error
  };
};

export default useUserData; 