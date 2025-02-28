import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import firebaseEmailHandler from "../../services/firebaseEmailHandler";

const EmailActionHandler: React.FC = () => {
  const location = useLocation();
  const { handleEmailAction } = firebaseEmailHandler();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const mode = queryParams.get("mode");
    const oobCode = queryParams.get("oobCode");
    const continueUrl = queryParams.get("continueUrl");
    const firebase_uid = queryParams.get("firebase_uid");

    if (mode && oobCode && continueUrl) {
      handleEmailAction(mode, oobCode, continueUrl);
    } else {
      console.error("Invalid or missing mode/oobCode/continueUrl");
    }
  }, [location.search]);

  return <div>Handling email action...</div>;
};

export default EmailActionHandler;