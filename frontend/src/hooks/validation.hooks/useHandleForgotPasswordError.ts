import { useState } from "react";

const useHandleForgotPasswordError = () => {
  const [error, setError] = useState(""); // State for handling errors

  const handleForgotPasswordError = (error: any) => {
    console.error("Forgot Password error:", error);

    const errorMessages: { [key: string]: string } = {
      "auth/user-not-found": "No account found with this email.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/network-request-failed": "Network error. Please check your connection.",
      // Add more error codes and messages as needed
    };

    // Set a friendly error message or fallback to Firebase's default message
    setError(
      errorMessages[error.code] ||
        "An unknown error occurred. Please try again."
    );
  };

  return { error, handleForgotPasswordError, setError };
};

export default useHandleForgotPasswordError;
