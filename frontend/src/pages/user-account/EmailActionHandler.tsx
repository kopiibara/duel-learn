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
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const mode = queryParams.get("mode");
    const oobCode = queryParams.get("oobCode");
    const continueUrl = queryParams.get("continueUrl");
    const firebase_uid = queryParams.get("firebase_uid");

    if (mode && oobCode) {
      handleEmailAction(mode, oobCode, continueUrl)
        .then((result) => {
          if (result?.success) {
            // Store result in localStorage for the original tab to check
            localStorage.setItem('emailActionResult', JSON.stringify({
              type: 'success',
              mode: result.mode,
              firebase_uid: result.firebase_uid,
              email: result.email,
              oobCode
            }));

            // Set success message based on mode
            if (result.mode === 'verifyEmail') {
              setSuccess("🌟 A Star Twinkles — Your Email Verification is Complete! 🌟");
            } else if (result.mode === 'resetPassword') {
              setSuccess("✨ Your password reset spell has been cast successfully! ✨");
            }
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error handling email action:", err);
          setError("The spell has faded — your magic link has expired.");
          setLoading(false);
        });
    } else {
      console.error("Invalid or missing mode/oobCode");
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

  return (
    <PageTransition>
      <div className="h-screen flex flex-col items-center justify-center">
        <div className="flex flex-col mb-11 items-center justify-center">
          <img
            src={emailError}
            style={{ width: "200px" }}
            alt="Profile Avatar"
          />
        </div>
        <div className="w-full max-w-md rounded-lg p-8 shadow-md">
          <p className="text-[18px] text-center text-[#9F9BAE] mb-8 max-w-[340px] mx-auto break-words">
            {error || success}
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
};

export default EmailActionHandler;