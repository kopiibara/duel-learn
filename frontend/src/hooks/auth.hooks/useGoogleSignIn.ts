import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import {
  auth,
  googleProvider,
  getAdditionalInfo,
} from "../../services/firebase";
import useGoogleSignUpApi, { GoogleSignUpError } from "../api.hooks/useGoogleSignUpApi";
import useHandleError from "../validation.hooks/useHandleError";
import { useState } from "react";

const useGoogleSignIn = () => {
  const navigate = useNavigate();
  const { googleSignUpApi } = useGoogleSignUpApi();
  const { handleLoginError } = useHandleError();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      const additionalUserInfo = getAdditionalInfo(result);
      const isNewUser = additionalUserInfo?.isNewUser ?? false;

      localStorage.setItem("userToken", token);

      // Call signUpApi with the required parameters for new users
      if (isNewUser) {
        try {
          await googleSignUpApi(
            result.user.uid,
            result.user.displayName,
            result.user.email,
            result.user.emailVerified,
            {
              creationTime: result.user.metadata.creationTime || null,
              lastSignInTime: result.user.metadata.lastSignInTime || null,
            }
          );
        } catch (error) {
          if (error instanceof GoogleSignUpError) {
            if (error.code === 'EMAIL_IN_USE') {
              // If email is already in use, sign out the user and redirect to login
              await auth.signOut();
              localStorage.removeItem("userToken");
              handleLoginError(new Error(error.message));
              setLoading(false);
              return;
            }
          }
          throw error; // Re-throw other errors to be caught by the outer catch block
        }
      }

      setTimeout(() => {
        if (isNewUser && result.user.emailVerified) {
          navigate("/dashboard/welcome");
        } else if (!result.user.emailVerified) {
          navigate("/dashboard/verify-email");
        } else {
          navigate("/dashboard/home");
        }
        setLoading(false);
      }, 2000);
    } catch (error: any) {
      handleLoginError(error);
      setLoading(false);
    }
  };

  return { handleGoogleSignIn, loading };
};

export default useGoogleSignIn;
