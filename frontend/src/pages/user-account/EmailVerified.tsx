import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { applyActionCode } from "firebase/auth";
import { auth } from "../../services/firebase";
import ProfileAvatar from "../../assets/images/profileAvatar.png";
import sampleAvatar2 from "../../assets/images/sampleAvatar2.png";
import PageTransition from "../../styles/PageTransition";

const EmailVerified = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationStatus, setVerificationStatus] = useState("");

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const oobCode = queryParams.get("oobCode");

    if (oobCode) {
      applyActionCode(auth, oobCode)
        .then(() => {
          setVerificationStatus("success");
        })
        .catch((error) => {
          setVerificationStatus("error");
        });
    } else {
      setVerificationStatus("invalid");
    }
  }, [location.search]);

  const handleBacktoLoginClick = () => {
    navigate("/login"); // Navigate to login when the button is clicked
  };

  return (
    <PageTransition>
      <div className="h-screen flex flex-col items-center justify-center">
        <div className="flex flex-col mb-11 items-center justify-center">
          <img
            src={sampleAvatar2}
            style={{ width: "200px" }}
            alt="Profile Avatar"
          />
        </div>

        <div className="w-full max-w-md rounded-lg p-8 shadow-md">
          {verificationStatus === "success" && (
            <p className="text-[18px] text-center text-[#9F9BAE] mb-8 max-w-[340px] mx-auto break-words">
              Congratulations! Your email has been successfully verified.
            </p>
          )}
          {verificationStatus === "error" && (
            <p className="text-[18px] text-center text-[#9F9BAE] mb-8 max-w-[340px] mx-auto break-words">
              There was an error verifying your email. Please try again.
            </p>
          )}
          {verificationStatus === "invalid" && (
            <p className="text-[18px] text-center text-[#9F9BAE] mb-8 max-w-[340px] mx-auto break-words">
              Invalid verification code.
            </p>
          )}
          <button
            type="button"
            className="w-full mt-2 bg-[#4D18E8] text-white py-3 rounded-lg hover:bg-[#6931E0] transition-colors"
            onClick={handleBacktoLoginClick}
          >
            Back to sign in
          </button>
        </div>
      </div>
    </PageTransition>
  );
};

export default EmailVerified;
