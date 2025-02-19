import { useNavigate } from "react-router-dom";
import { getAuth, applyActionCode, checkActionCode } from "firebase/auth";

const firebaseEmailHandler = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleEmailAction = async (mode: any, oobCode: any, continueUrl: any) => {
    try {
      let firebase_uid = "";
      if (continueUrl) {
        const decodedContinueUrl = decodeURIComponent(continueUrl);
        const nestedParams = new URLSearchParams(decodedContinueUrl.split('?')[1]);
        firebase_uid = nestedParams.get("firebase_uid") || "";
      }
      console.log("firebase_uid:", firebase_uid);

      switch (mode) {
        case "resetPassword":
          await checkActionCode(auth, oobCode);
          navigate(`/reset-password?oobCode=${oobCode}&firebase_uid=${firebase_uid}`);
          break;
        case "verifyEmail":
          await applyActionCode(auth, oobCode);
          navigate(`/email-verified?oobCode=${oobCode}`);
          break;
        default:
          throw new Error("Invalid mode");
      }
    } catch (error) {
      console.error("Error handling email action:", error);
    }
  };

  return { handleEmailAction };
};

export default firebaseEmailHandler;