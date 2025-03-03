import { useState, useEffect } from "react";
import { linkWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import bcrypt from "bcryptjs";
import useEditUsernameValidation from "./validation.hooks/useEditUsernameValidation";
import useChangePasswordValidation from "./validation.hooks/useChangePasswordValidation";
import useUpdateUserDetailsApi from "./api.hooks/useUpdateUserDetailsApi";

const useAccountSettings = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [userData, setUserData] = useState<any>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [isCreatingPassword, setIsCreatingPassword] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const { errors, validate } = useEditUsernameValidation(userData, userData.firebase_uid);
  const { errors: passwordErrors, validatePassword } = useChangePasswordValidation();
  const { updateUserDetailsApi, apiError } = useUpdateUserDetailsApi();
  const [error, setError] = useState({ general: "" });
  const [hasNoPassword, setHasNoPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
    setUserData(storedUserData);
  }, []);

  useEffect(() => {
    const hasNoPassword = userData.password_hash === "N/A";
    setHasNoPassword(hasNoPassword);
  }, [userData]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    if (!isEditing) return;

    const validationErrors = validate("username", userData.username);
    if (Object.keys(validationErrors).length > 0) {
      setError({ general: "Please fix the validation errors before saving." });
      return;
    }

    setIsLoading(true);
    console.log("handleSaveClick called");

    console.log(
      "Saving user details:",
      userData.firebase_uid,
      userData.username,
      (isChangingPassword || isCreatingPassword) ? userData.newpassword : undefined
    );

    try {
      const userDoc = await getDoc(doc(db, "users", userData.firebase_uid));
      if (userDoc.exists()) {
        const userDataFromDb = userDoc.data();
        if ((isChangingPassword || isCreatingPassword) && userData.newpassword) {
          const isMatch = await bcrypt.compare(
            userData.newpassword,
            userDataFromDb.password_hash
          );
          console.log("isMatch:", isMatch);
          if (isMatch) {
            setError({ general: "Cannot use old password. Please try again" });
            setIsLoading(false);
            return;
          }
        }
      }

      if (isCreatingPassword) {
        const credential = EmailAuthProvider.credential(userData.email, userData.newpassword);
        await linkWithCredential(auth.currentUser!, credential);
        console.log("Password linked successfully");
      }

      await updateUserDetailsApi(
        userData.firebase_uid,
        userData.username,
        (isChangingPassword || isCreatingPassword) ? userData.newpassword : undefined
      );
      console.log("User details saved successfully");

      setIsEditing(false);
      setIsChangingPassword(false);
      setIsCreatingPassword(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Error updating user details:", error);
      setError({ general: "Error updating user details. Please try again." });
      setIsLoading(false);
    }
  };

  const handleDiscardClick = () => {
    setIsLoading(true);
    const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
    setUserData(storedUserData);
    setIsEditing(false);
    setIsChangingPassword(false);
    setIsCreatingPassword(false);
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.id]: e.target.value });
  };

  const handlePasswordChangeClick = () => {
    setIsChangingPassword(true);
  };

  const handleCreatePasswordClick = () => {
    setIsCreatingPassword(true);
  };

  const handleLinkCredential = async () => {
    const { newpassword } = userData;
    const credential = EmailAuthProvider.credential(userData.email, newpassword);

    try {
      await linkWithCredential(auth.currentUser!, credential);
      console.log("Password linked successfully");

      await updateUserDetailsApi(
        userData.firebase_uid,
        userData.username,
        newpassword
      );

      handleSaveClick();
    } catch (error) {
      console.error("Error linking password:", error);
    }
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const hasChanges = () => {
    const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
    return JSON.stringify(storedUserData) !== JSON.stringify(userData);
  };

  return {
    selectedIndex,
    setSelectedIndex,
    userData,
    isEditing,
    isChangingPassword,
    isCreatingPassword,
    showPassword,
    showConfirmPassword,
    errors,
    passwordErrors,
    error,
    hasNoPassword,
    isLoading,
    handleEditClick,
    handleSaveClick,
    handleDiscardClick,
    handleInputChange,
    handlePasswordChangeClick,
    handleCreatePasswordClick,
    handleLinkCredential,
    togglePassword,
    toggleConfirmPassword,
    hasChanges,
    validate,
    validatePassword,
  };
};

export default useAccountSettings;