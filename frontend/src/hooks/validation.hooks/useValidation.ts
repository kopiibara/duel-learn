import { useState } from "react";
import usePasswordValidation from "./usePasswordValidation";

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

const useValidation = () => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { validatePassword } = usePasswordValidation();

  const validate = (field: string, value: string, formData: any = {}) => {
    let error = "";

    switch (field) {
      case "username":
        error = usernameValidation(value);
        break;
      case "email":
        error = emailValidation(value);
        break;
      case "password":
      case "confirmPassword":
        error = validatePassword(field, value, formData);
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

  const validateForm = (fields: { [key: string]: string }) => {
    let valid = true;
    for (const field in fields) {
      const error = validate(field, fields[field], fields);
      if (error) valid = false;
    }
    return valid;
  };

  return { errors, validate, validateForm };
};

export default useValidation;