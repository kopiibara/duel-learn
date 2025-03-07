import { useState } from "react";
import { auth } from "../../services/firebase";

interface StoredUserData {
  user: {
    username: string;
    email: string;
    password: string;
  }
}

interface SignUpResponse {
  message: string;
  firebase_uid: string;
}

const useSignUpApi = () => {
  const [apiError, setApiError] = useState<string | null>(null);

  const signUpApi = async (
    firebase_uid: string,
    isNew: boolean,
    email_verified: boolean
  ): Promise<SignUpResponse> => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("No authentication token available");

      console.log("SignUpApi received params:", {
        firebase_uid,
        isNew,
        email_verified,
        currentUserEmail: auth.currentUser?.email,
        currentUserVerified: auth.currentUser?.emailVerified
      });

      // 1. Get stored user data
      const storedUserResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/store-user/${firebase_uid}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          }
        }
      );

      if (!storedUserResponse.ok) {
        const errorData = await storedUserResponse.json();
        throw new Error(errorData.error || "Failed to fetch stored user data");
      }

      const storedUserData: StoredUserData = await storedUserResponse.json();
      console.log("Stored user data:", storedUserData);
      
      // 2. Verify data consistency
      if (!auth.currentUser?.email || storedUserData.user.email !== auth.currentUser.email) {
        throw new Error("User data verification failed");
      }

      // 3. Sign up user
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/sign-up`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            firebase_uid,
            username: storedUserData.user.username,
            email: storedUserData.user.email,
            password: storedUserData.user.password,
            isNew,
            email_verified,
          }), 
        }
      );

      console.log("Sign-up response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to sign up user");
      }

      const responseData = await response.json();
      console.log("Sign-up response data:", responseData);
      return responseData;
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      setApiError(message);
      throw error;
    }
  };

  return { signUpApi, apiError };
};

export default useSignUpApi;