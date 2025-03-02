import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import firebaseEmailHandler from "../../services/firebaseEmailHandler";
import LoadingScreen from "../../components/LoadingScreen";
import PageTransition from "../../styles/PageTransition";
import emailError from "../../assets/general/EmailSent.png";
const EmailActionHandler: React.FC = () => {
  const location = useLocation();
  const { handleEmailAction } = firebaseEmailHandler();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const mode = queryParams.get("mode");
    const oobCode = queryParams.get("oobCode");
    const continueUrl = queryParams.get("continueUrl");

    if (mode && oobCode && continueUrl) {
      handleEmailAction(mode, oobCode, continueUrl)
        .then(() => setLoading(false))
        .catch((err) => {
          console.error("Error handling email action:", err);
          setError("The spell has faded — your magic link has expired.");
          setLoading(false);
        });
    } else {
      console.error("Invalid or missing mode/oobCode/continueUrl");
      setError("Invalid or missing parameters.");
      setLoading(false);
    }
  }, [location.search]);

  const handleCloseTab = () => {
    window.close();
  };

  if (loading) {
    return (
      <PageTransition>
        <LoadingScreen text="Conjuring Email Action" />
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="h-screen flex flex-col items-center justify-center">
        <div className="flex flex-col mb-11 items-center justify-center">
          {/* <img src={ProfileAvatar} alt="" className="w-40 h-40" /> */}
          <img
            src={emailError}
            style={{ width: "200px" }}
            alt="Profile Avatar"
          />
        </div>
          <div className="w-full max-w-md rounded-lg p-8 shadow-md">
            <p className="text-[18px] text-center text-[#9F9BAE] mb-8 max-w-[340px] mx-auto break-words">
              {error}
            </p>
            <button
              className="w-full mt-2 bg-[#4D18E8] text-white py-3 rounded-lg hover:bg-[#6931E0] transition-colors"
              onClick={handleCloseTab}
            >
              Close
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return <div>Handling email action...</div>;
};

export default EmailActionHandler;