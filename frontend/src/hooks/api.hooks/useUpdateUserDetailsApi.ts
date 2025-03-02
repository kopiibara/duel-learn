import { useState } from "react";

const useUpdateUserDetailsApi = () => {
  const [apiError, setApiError] = useState<string | null>(null);

  const updateUserDetailsApi = async (
    firebase_uid: string,
    username?: string,
    newpassword?: string
  ) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/update-user-details`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ firebase_uid, username, newpassword }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user details");
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      setApiError(error.message);
      throw error;
    }
  };

  return { updateUserDetailsApi, apiError };
};

export default useUpdateUserDetailsApi;
