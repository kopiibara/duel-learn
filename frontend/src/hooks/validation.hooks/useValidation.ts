import { useState, useEffect } from "react";
import usePasswordValidation from "./usePasswordValidation";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore"; // Import Firestore methods

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

const emailValidation = (value: string) => {
  if (!value) {
    return "Email is required.";
  } else if (!/\S+@\S+\.\S+/.test(value)) {
    return "Please enter a valid email address.";
  }
  return "";
};

const termsValidation = (value: string) => {
  if (value !== "true") {
    return "You must agree to the terms and conditions.";
  }
  return "";
};

const checkUsernameUnique = async (username: string) => {
  const db = getFirestore();
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", username));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
};

const useValidation = (formData: any) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { validatePassword } = usePasswordValidation();

  const validate = async (field: string, value: string, formData: any = {}, passwordField: string = "password") => {
    let error = "";

    switch (field) {
      case "username":
        error = usernameValidation(value);
        if (!error) {
          const isUnique = await checkUsernameUnique(value);
          if (!isUnique) {
            error = "Username is taken.";
          }
        }
        break;
      case "email":
        error = emailValidation(value);
        break;
      case "password":
      case "confirmPassword":
      case "newpassword":
        error = validatePassword(field, value, formData, passwordField);
        break;
      case "terms":
        error = termsValidation(value);
        break;
      default:
        break;
    }

    setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
    return error;
  };

  const validateForm = async (fields: { [key: string]: string }, passwordField: string = "password") => {
    let valid = true;
    for (const field in fields) {
      const error = await validate(field, fields[field], fields, passwordField);
      if (error) valid = false;
    }
    return valid;
  };

  useEffect(() => {
    const validateUsername = async () => {
      if (formData.username) {
        await validate("username", formData.username, formData);
      }
    };
    validateUsername();
  }, [formData.username]);

  return { errors, validate, validateForm };
};

export default useValidation;