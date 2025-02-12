import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, applyActionCode, checkActionCode } from "firebase/auth";

const EmailActionHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

  const handleEmailAction = async (mode: string, oobCode: string) => {
    try {
      switch (mode) {
        case "resetPassword":
          // Verify the password reset code is valid
          await checkActionCode(auth, oobCode);
          navigate(`/resetPassword?oobCode=${oobCode}`);
          break;
        case "verifyEmail":
          // Apply the email verification code
          await applyActionCode(auth, oobCode);
          navigate("/emailVerified");
          break;
        default:
          throw new Error("Invalid mode");
      }
    } catch (error) {
      console.error("Error handling email action:", error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const mode = queryParams.get("mode");
    const oobCode = queryParams.get("oobCode");

    if (mode && oobCode) {
      handleEmailAction(mode, oobCode);
    } else {
      // Handle invalid or missing parameters
      console.error("Invalid or missing mode/oobCode");
    }
  }, [location.search]);

  return <div>Handling email action...</div>;
};

export default EmailActionHandler;