import { useNavigate } from "react-router-dom";
import { getAuth, applyActionCode, checkActionCode } from "firebase/auth";

const firebaseEmailHandler = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleEmailAction = async (mode: any, oobCode: any) => {
    try {
      switch (mode) {
        case "resetPassword":
          // Verify the password reset code is valid
          await checkActionCode(auth, oobCode);
          navigate(`/reset-password?oobCode=${oobCode}`);
          break;
        case "verifyEmail":
          // Apply the email verification code
          await applyActionCode(auth, oobCode);
          navigate("/email-verified");
          break;
        default:
          throw new Error("Invalid mode");
      }
    } catch (error) {
      console.error("Error handling email action:", error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  return { handleEmailAction };
};

export default firebaseEmailHandler;