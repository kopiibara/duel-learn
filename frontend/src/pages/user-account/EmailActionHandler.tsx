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
