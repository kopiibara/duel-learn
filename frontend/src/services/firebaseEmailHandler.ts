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
          await applyActionCode(auth, oobCode);
          console.log("Email verification successful");
          return { success: true, mode: "verifyEmail", firebase_uid, email };
        default:
          throw new Error("Invalid mode");
      }
    } catch (error) {
      console.error("Error handling email action:", error);
      throw error;
    }
  };

  return { handleEmailAction };
};

export default firebaseEmailHandler;