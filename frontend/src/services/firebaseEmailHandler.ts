import { useNavigate } from "react-router-dom";
import { getAuth, applyActionCode, checkActionCode } from "firebase/auth";

const firebaseEmailHandler = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleEmailAction = async (mode: any, oobCode: any, continueUrl: any) => {
    try {
      let firebase_uid = "";
      let email = "";
      if (continueUrl) {
        const decodedContinueUrl = decodeURIComponent(continueUrl);
        const nestedParams = new URLSearchParams(decodedContinueUrl.split('?')[1]);
        firebase_uid = nestedParams.get("firebase_uid") || "";
        email = nestedParams.get("email") || "";
      }
      console.log("firebase_uid:", firebase_uid);
      console.log("oobCode:", oobCode);

      switch (mode) {
        case "resetPassword":
          await checkActionCode(auth, oobCode);
          return { success: true, mode: "resetPassword", firebase_uid, email };
        case "verifyEmail":
          try {
            // First verify the action code is valid
            await checkActionCode(auth, oobCode);
            // Then apply the action code
            await applyActionCode(auth, oobCode);
            console.log("Email verification successful");
            return { success: true, mode: "verifyEmail", firebase_uid, email };
          } catch (error: any) {
            console.error("Detailed verification error:", {
              code: error.code,
              message: error.message,
              stack: error.stack
            });
            
            if (error.code === 'auth/invalid-action-code') {
              throw new Error("This verification link has expired or has already been used. Please request a new verification email.");
            }
            throw error;
          }
        default:
          throw new Error("Invalid mode");
      }
    } catch (error: any) {
      console.error("Error handling email action:", error);
      throw error;
    }
  };

  return { handleEmailAction };
};

export default firebaseEmailHandler;