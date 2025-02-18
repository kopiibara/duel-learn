import { useNavigate } from "react-router-dom";
import React from "react";
import ProfileAvatar from "../../assets/images/profileAvatar.png";
import sampleAvatar2 from "../../assets/images/sampleAvatar2.png";
import PageTransition from "../../styles/PageTransition";

const EmailVerified = () => {
  const navigate = useNavigate();

  const handleBacktoLoginClick = () => {
    navigate("/login"); // Navigate to login when the button is clicked
  };

  return (
    <PageTransition>
      <div className="h-screen flex flex-col items-center justify-center">
        <div className="flex flex-col mb-11 items-center justify-center">
          {/* <img src={ProfileAvatar} alt="" className="w-40 h-40" /> */}
          <img
            src={sampleAvatar2}
            style={{ width: "200px" }}
            alt="Profile Avatar"
          />
        </div>

        <div className="w-full max-w-md rounded-lg p-8 shadow-md">
          <p className="text-[18px] text-center text-[#9F9BAE] mb-8 max-w-[340px] mx-auto break-words">
            Congratulations! Your email has been successfully verified.
          </p>
          {/* Submit Button */}
          <button
            type="submit"
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
