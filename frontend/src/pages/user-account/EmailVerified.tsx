import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { applyActionCode } from "firebase/auth";
import { auth } from "../../services/firebase";
import sampleAvatar2 from "../../assets/images/sampleAvatar2.png";
import PageTransition from "../../styles/PageTransition";
import { toast } from "react-hot-toast";

const EmailVerified = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const oobCode = queryParams.get("oobCode");
    const mode = queryParams.get("mode");

    if (mode === "verifyEmail" && oobCode) {
      applyActionCode(auth, oobCode)
        .then(() => {
          setIsVerified(true);
          toast.success("Email has been successfully verified.");
        })
        .catch((error) => {
          console.error("Error verifying email:", error);
          toast.error("Failed to verify email. Please try again.");
        });
    }
  }, [location]);

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
