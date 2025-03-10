import { useState, useEffect } from "react";
import { linkWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import bcrypt from "bcryptjs";
import useUpdateUserDetailsApi from "./api.hooks/useUpdateUserDetailsApi";
import { useUser } from "../contexts/UserContext";
<<<<<<< HEAD

const useAccountSettings = () => {
  const { updateUser } = useUser();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [userData, setUserData] = useState<any>({});
=======
import { useFormik } from "formik";
import * as Yup from "yup";

const useAccountSettings = () => {
  const { user, setUser } = useUser();
>>>>>>> cfa57d4327f05816e98fd7fdf169bc5cd8f299fd
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [isCreatingPassword, setIsCreatingPassword] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const { updateUserDetailsApi } = useUpdateUserDetailsApi();
  const [error, setError] = useState({ general: "" });
  const [hasNoPassword, setHasNoPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Track changes for each field
  const [changedFields, setChangedFields] = useState({
    username: false,
    display_picture: false,
    password: false
  });

  // Validation Schema
  const validationSchema = Yup.object({
    username: Yup.string()
      .required("Username is required")
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .matches(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    newpassword: Yup.string()
      .when([], {
        is: () => isChangingPassword || isCreatingPassword,
        then: (schema) => schema
          .required("Password is required")
          .min(8, "Password must be at least 8 characters")
          .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
          ),
        otherwise: (schema) => schema
      }),
    confirmPassword: Yup.string()
      .when([], {
        is: () => isChangingPassword || isCreatingPassword,
        then: (schema) => schema
          .required("Please confirm your password")
          .oneOf([Yup.ref("newpassword")], "Passwords must match"),
        otherwise: (schema) => schema
      })
  });

  // Check if username exists in Firestore
  const checkUsernameExists = async (username: string): Promise<boolean> => {
    try {
      // Query Firestore for documents with matching username
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
      
      // If no documents found, username is available
      if (querySnapshot.empty) {
        return false;
      }
      
      // If username exists, check if it belongs to current user
      let belongsToCurrentUser = false;
      querySnapshot.forEach((doc) => {
        if (doc.id === user?.firebase_uid) {
          belongsToCurrentUser = true;
        }
      });
      
      // If username belongs to current user, it's not a conflict
      return !belongsToCurrentUser;
    } catch (error) {
      console.error("Error checking username:", error);
      return false; // Assume no conflict in case of error
    }
  };

  const formik = useFormik({
    initialValues: {
      username: user?.username || "",
      newpassword: "",
      confirmPassword: "",
      display_picture: user?.display_picture || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError({ general: "" });

<<<<<<< HEAD
    const validationErrors = validate("username", userData.username);
    if (Object.keys(validationErrors).length > 0) {
      setError({ general: "Please fix the validation errors before saving." });
      return;
    }

    setIsLoading(true);
    console.log("handleSaveClick called");

    const hasProfilePictureChanged =
      originalProfilePicture !== userData.display_picture;
    const originalUsername = JSON.parse(
      localStorage.getItem("userData") || "{}"
    ).username;
    const hasUsernameChanged = originalUsername !== userData.username;

    try {
      const userDoc = await getDoc(doc(db, "users", userData.firebase_uid));
      if (userDoc.exists()) {
        const userDataFromDb = userDoc.data();
        if (
          (isChangingPassword || isCreatingPassword) &&
          userData.newpassword
        ) {
          const isMatch = await bcrypt.compare(
            userData.newpassword,
            userDataFromDb.password_hash
          );
          console.log("isMatch:", isMatch);
          if (isMatch) {
            setError({ general: "Cannot use old password. Please try again" });
=======
      try {
        // Check if username is being changed and verify it's not taken
        if (changedFields.username && values.username !== user?.username) {
          const usernameExists = await checkUsernameExists(values.username);
          if (usernameExists) {
            setError({ general: "Username already taken by another user" });
>>>>>>> cfa57d4327f05816e98fd7fdf169bc5cd8f299fd
            setIsLoading(false);
            return;
          }
        }

        // Only check password if it's being changed
        if (changedFields.password) {
          const userDoc = await getDoc(doc(db, "users", user!.firebase_uid));
          if (userDoc.exists()) {
            const userDataFromDb = userDoc.data();
            if (values.newpassword) {
              const isMatch = await bcrypt.compare(
                values.newpassword,
                userDataFromDb.password_hash
              );
              if (isMatch) {
                setError({ general: "Cannot use old password. Please try again" });
                setIsLoading(false);
                return;
              }
            }
          }

          if (isCreatingPassword) {
            const credential = EmailAuthProvider.credential(
              user!.email!,
              values.newpassword
            );
            await linkWithCredential(auth.currentUser!, credential);
            console.log("Password linked successfully");
          }
        }

        // Only update display picture in Firestore if it changed
        if (changedFields.display_picture) {
          await updateDoc(doc(db, "users", user!.firebase_uid), {
            display_picture: values.display_picture,
            updated_at: new Date(),
          });
        }
<<<<<<< HEAD

        // If username has changed, update study materials
        if (hasUsernameChanged) {
          console.log(
            "Username changed from",
            originalUsername,
            "to",
            userData.username
          );
          try {
            const response = await fetch(
              `${
                import.meta.env.VITE_BACKEND_URL
              }/api/study-material/update-creator`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  created_by: userData.username,
                  created_by_id: userData.firebase_uid,
                }),
                credentials: "include",
              }
            );

            if (!response.ok) {
              console.error(
                "Failed to update study material creator:",
                await response.text()
              );
            } else {
              console.log("Study material creator updated successfully");
            }
          } catch (error) {
            console.error("Error updating study material creator:", error);
          }
        }
      }
=======
>>>>>>> cfa57d4327f05816e98fd7fdf169bc5cd8f299fd

        // Update user details through API only for changed fields
        await updateUserDetailsApi(
          user!.firebase_uid,
          changedFields.username ? values.username : undefined,
          changedFields.password ? values.newpassword : undefined,
          changedFields.display_picture ? values.display_picture : undefined
        );

        console.log("User details saved successfully");

        // Update user state and storage with only changed fields
        const updatedUserData = {
          ...user!,
          ...(changedFields.username && { username: values.username }),
          ...(changedFields.display_picture && { display_picture: values.display_picture }),
        };
        setUser(updatedUserData);
        localStorage.setItem("userData", JSON.stringify(updatedUserData));
        sessionStorage.setItem("userData", JSON.stringify(updatedUserData));
        
        // Reset all states
        setIsEditing(false);
        setIsChangingPassword(false);
        setIsCreatingPassword(false);
        setChangedFields({
          username: false,
          display_picture: false,
          password: false
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Error updating user details:", error);
        setError({ general: "Error updating user details. Please try again." });
        setIsLoading(false);
      }
<<<<<<< HEAD

      await updateUserDetailsApi(
        userData.firebase_uid,
        userData.username,
        isChangingPassword || isCreatingPassword
          ? userData.newpassword
          : undefined,
        hasProfilePictureChanged ? userData.display_picture : undefined
      );

      console.log("User details saved successfully");

      localStorage.setItem("userData", JSON.stringify(userData));
      setOriginalProfilePicture(userData.display_picture || "");

      if (userData.display_picture !== originalProfilePicture) {
        updateUser({ display_picture: userData.display_picture });
      }

      setIsEditing(false);
      setIsChangingPassword(false);
      setIsCreatingPassword(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Error updating user details:", error);
      setError({ general: "Error updating user details. Please try again." });
      setIsLoading(false);
=======
>>>>>>> cfa57d4327f05816e98fd7fdf169bc5cd8f299fd
    }
  });

  useEffect(() => {
    if (user) {
      formik.setValues({
        username: user.username || "",
        newpassword: "",
        confirmPassword: "",
        display_picture: user.display_picture || "",
      });
      // Reset change tracking when user data is loaded
      setChangedFields({
        username: false,
        display_picture: false,
        password: false
      });
    }
  }, [user]);

  useEffect(() => {
    const hasNoPassword = user?.isSSO || false;
    setHasNoPassword(hasNoPassword);
  }, [user]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleDiscardClick = () => {
    setIsLoading(true);
    formik.resetForm();
    setIsEditing(false);
    setIsChangingPassword(false);
    setIsCreatingPassword(false);
    setChangedFields({
      username: false,
      display_picture: false,
      password: false
    });
    setIsLoading(false);
  };

  const handlePasswordChangeClick = () => {
    setIsChangingPassword(true);
    setChangedFields(prev => ({ ...prev, password: true }));
  };

  const handleCreatePasswordClick = () => {
    setIsCreatingPassword(true);
    setChangedFields(prev => ({ ...prev, password: true }));
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleProfilePictureChange = (newPicture: string) => {
    formik.setFieldValue("display_picture", newPicture);
    setChangedFields(prev => ({ ...prev, display_picture: true }));
  };

  // Track username changes
  const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    formik.handleChange(e);
    
    if (newUsername !== user?.username) {
      // Set as changed to enable saving
      setChangedFields(prev => ({ ...prev, username: true }));
    } else {
      setChangedFields(prev => ({ ...prev, username: false }));
    }
  };

  const hasChanges = () => {
    return Object.values(changedFields).some(Boolean);
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true);
      const token = await auth.currentUser?.getIdToken()
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/delete-account`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            firebase_uid: user!.firebase_uid,
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete account");
      }

      await auth.signOut();
      localStorage.removeItem("userData");
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting account:", error);
      setError({
        general:
          error instanceof Error
            ? error.message
            : "Failed to delete account. Please try again.",
      });
    } finally {
      setIsDeletingAccount(false);
      setIsDeleteModalOpen(false);
    }
  };

  const openDeleteModal = () => setIsDeleteModalOpen(true);
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  return {
    formik,
    isEditing,
    isChangingPassword,
    isCreatingPassword,
    showPassword,
    showConfirmPassword,
    error,
    hasNoPassword,
    isLoading,
    handleEditClick,
    handleDiscardClick,
    handlePasswordChangeClick,
    handleCreatePasswordClick,
    togglePassword,
    toggleConfirmPassword,
    hasChanges,
    handleProfilePictureChange,
    handleUsernameChange,
    isDeleteModalOpen,
    isDeletingAccount,
    openDeleteModal,
    closeDeleteModal,
    handleDeleteAccount,
    changedFields
  };
};

export default useAccountSettings;
