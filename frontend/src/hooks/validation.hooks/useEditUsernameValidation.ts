import { useState, useCallback } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore"; // Import Firestore methods

const usernameValidation = (value: string) => {
  if (!value) {
    return "Username is required.";
  } else if (value.length < 8) {
    return "Username must be at least 8 characters.";
  } else if (value.length > 20) {
    return "Username cannot exceed 20 characters.";
  } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
    return "Username can only contain alphanumeric characters and underscores.";
  }
  return "";
};

const checkUsernameUnique = async (username: string, currentUserId: string) => {
  const db = getFirestore();
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", username));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return true;
  }
  const userDoc = querySnapshot.docs[0];
  return userDoc.id === currentUserId;
};

const useEditUsernameValidation = (userData: any) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = useCallback(
    async (field: string, value: string) => {
      let newErrors: { [key: string]: string } = { ...errors };

      if (field === "username") {
        // Clear previous error for this field
        delete newErrors.username;

        // Basic validations
        if (!value.trim()) {
          newErrors.username = "Username is required";
        } else if (value.length < 3) {
          newErrors.username = "Username must be at least 3 characters";
        } else if (value.length > 20) {
          newErrors.username = "Username cannot exceed 20 characters";
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          newErrors.username =
            "Username can only contain letters, numbers, and underscores";
        } else {
          try {
            // Check if username has actually changed before making the API call
            const currentUsername = userData?.username;

            // Only check for uniqueness if the username is different from current
            if (value !== currentUsername) {
              const response = await fetch(
                `${
                  import.meta.env.VITE_BACKEND_URL
                }/api/user/check-username?username=${encodeURIComponent(value)}`
              );

              const data = await response.json();

              if (data.exists) {
                newErrors.username = "Username has been taken";
              }
            }
          } catch (error) {
            console.error("Error checking username:", error);
          }
        }
      }

      setErrors(newErrors);
      return newErrors;
    },
    [errors, userData?.username]
  );

  return { errors, validate };
};

export default useEditUsernameValidation;
