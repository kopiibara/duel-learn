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
    let firebase_uid = "";

    if (continueUrl) {
      // Decode the continueUrl parameter to get the nested URL parameters
      const decodedContinueUrl = decodeURIComponent(continueUrl);
      const nestedParams = new URLSearchParams(decodedContinueUrl.split('?')[1]);
      firebase_uid = nestedParams.get("firebase_uid") || "";
    }

    if (mode && oobCode && firebase_uid) {
      handleEmailAction(mode, oobCode, firebase_uid);
    } else {
      // Handle invalid or missing parameters
      console.error("Invalid or missing mode/oobCode/firebase_uid");
    }
  }, [location.search]);

  return <div>Handling email action...</div>;
};

export default EmailActionHandler;