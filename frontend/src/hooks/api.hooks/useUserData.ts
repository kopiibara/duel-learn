import { useState } from 'react';

const useUserData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAndUpdateUserData = async (firebase_uid: string, token: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/info/${firebase_uid}`,
        {
          method: 'GET',
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
      return userData;
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