import { Link, useNavigate, useLocation } from "react-router-dom";
import ExitIcon from "../../assets/images/Exit.png";
import { useState, useEffect } from "react";
import {
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Modal,
} from "@mui/material";
import axios from "axios"; // Ensure axios is imported
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "../../services/firebase"; // Adjust the path as needed
import { collection, query, where, getDocs } from "firebase/firestore";
import useValidation from "../../utils/useValidation";
import PageTransition from "../../styles/PageTransition";
import sampleAvatar2 from "../../assets/images/sampleAvatar2.png"; // Add this import
const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get location object
  // Retrieve the email passed from the previous page
  const { email } = location.state || {};

  const [isInvalidModalOpen, setIsInvalidModalOpen] = useState(false);

  useEffect(() => {
    const oobCode = new URLSearchParams(location.search).get("oobCode");
    if (!oobCode) {
      setError({ general: "Invalid or missing reset code." });
      setIsInvalidModalOpen(true);
      setLoading(false);
      return;
    }

    const validateCode = async () => {
      try {
        await verifyPasswordResetCode(auth, oobCode);
      } catch (err) {
        setError({ general: "Reset code is invalid or expired." });
        setIsInvalidModalOpen(true);
      } finally {
        setLoading(false);
      }
    };
    validateCode();
  }, [location.search]);

  console.log("Email received from location SecurityCode:", email);

  const [formData, setFormData] = useState({
    newpassword: "", // Only password is used here
    confirmPassword: "", // New field for confirming password
  });

  const { errors, validate, validateForm } = useValidation();

  const [loading, setLoading] = useState(false); // Loading state for the submit button

  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for toggling confirm password visibility
  const togglePassword = () => {
    setShowPassword(!showPassword); // Toggle password visibility
  };
  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword); // Toggle confirm password visibility
  };

  const [error, setError] = useState({ general: "" }); // For general errors

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { newpassword, confirmPassword } = formData;

    const formIsValid = validateForm({
      newpassword,
      confirmPassword,
      password: newpassword, // Pass newpassword as password for validation
    });

    if (!formIsValid) {
      return;
    }

    setLoading(true); // Start loading spinner

    const oobCode = new URLSearchParams(location.search).get("oobCode");
    if (!oobCode) {
      setError({ general: "Invalid or missing reset code." });
      setIsInvalidModalOpen(true);
      setLoading(false);
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, newpassword);
      alert("Password successfully reset!");
      navigate("/login");
    } catch (err) {
      setError({ general: "Failed to reset password." });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Update the input value
    setFormData((prevData) => ({ ...prevData, [field]: value }));

    // Validate the field on change
    validate(field, value, { ...formData, [field]: value });

    // Clear the general error when typing in either field
    setError({ general: "" });
  };

  const handleExitClick = () => {
    navigate("/"); // Navigate to home when the exit icon is clicked
  };

  const handleBacktoLoginClick = () => {
    navigate("/login"); // Navigate to login when the button is clicked
  };

  return (
    <PageTransition>
      <div className="h-screen mt-[-30px] flex flex-col items-center justify-center">
        <header className="absolute top-20 left-20 right-20 flex justify-between items-center">
          {/* Logo & Title */}
          <Link to="/" className="flex items-center space-x-4">
            <img src="/duel-learn-logo.svg" className="w-10 h-10" alt="icon" />
            <p className="text-white text-xl font-semibold">Duel Learn</p>
          </Link>

          {/* Exit Button */}
          {/* <img
          src={ExitIcon}
          alt="Exit Icon"
          style={{ width: "39px" }}
          className="hover:scale-110 cursor-pointer"
          onClick={handleExitClick}
        /> */}
        </header>

        <div className="w-full max-w-md rounded-lg p-8 shadow-md">
          {/* Heading */}
          <h1 className="text-3xl font-bold text-center text-white mb-2">
            Reset Password
          </h1>
          <p className="text-lg text-center text-[#9F9BAE] mb-8 max-w-[370px] mx-auto break-words">
            Your new password must be different from your previously used
            password.
          </p>

          {/* Error Message Box */}
          {error.general && (
            <div className="w-full max-w-sm mb-4 px-4 py-2 bg-red-100 text-red-600 rounded-md border border-red-300">
              {error.general}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* New Password Input */}
            <div className="mb-4 relative">
              <div className="relative">
                <input
                  id="password-field"
                  type={showPassword ? "text" : "password"}
                  value={formData.newpassword}
                  onChange={(e) =>
                    handleInputChange("newpassword", e.target.value)
                  }
                  onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                  className={`block w-full p-3 rounded-lg bg-[#3B354D] text-[#E2DDF3] placeholder-[#9F9BAE] focus:outline-none focus:ring-2 focus:ring-[#4D18E8] pr-12 ${
                    errors.newpassword ? "border border-red-500" : ""
                  }`}
                  placeholder="Enter new password"
                />
                {/* Password Toggle Button */}
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute inset-y-0 right-4 flex items-center text-[#9F9BAE]"
                >
                  {showPassword ? (
                    <VisibilityRoundedIcon className="w-5 h-5" />
                  ) : (
                    <VisibilityOffRoundedIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.newpassword && (
                <div className="text-red-500 text-sm mt-1">
                  {errors.newpassword}
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="mb-8 relative">
              <div className="relative">
                <input
                  id="confirm-password-field"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                  className={`block w-full p-3 rounded-lg bg-[#3B354D] text-[#E2DDF3] placeholder-[#9F9BAE] focus:outline-none focus:ring-2 focus:ring-[#4D18E8] pr-12 ${
                    errors.confirmPassword ? "border border-red-500" : ""
                  }`}
                  placeholder="Confirm password"
                />
                {/* Confirm Password Toggle Button */}
                <button
                  type="button"
                  onClick={toggleConfirmPassword}
                  className="absolute inset-y-0 right-4 flex items-center text-[#9F9BAE]"
                >
                  {showConfirmPassword ? (
                    <VisibilityRoundedIcon className="w-5 h-5" />
                  ) : (
                    <VisibilityOffRoundedIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#4D18E8] text-white py-3 rounded-md hover:bg-[#4D18E8] focus:ring-4 focus:ring-[#4D18E8]"
              disabled={loading} // Disable the button when loading
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" /> // Show the loading spinner
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </div>
      </div>
      <Modal
        open={isInvalidModalOpen}
        onClose={() => setIsInvalidModalOpen(false)}
        aria-labelledby="invalid-modal-title"
        aria-describedby="invalid-modal-description"
      >
        <div className="h-screen flex flex-col items-center justify-center bg-black">
          <div className="flex flex-col mb-11 items-center justify-center">
            <img
              src={sampleAvatar2}
              style={{ width: "200px" }}
              alt="Profile Avatar"
            />
          </div>
          <div className="w-full max-w-md rounded-lg p-8 shadow-md bg-black">
            <p className="text-[18px] text-center text-[#9F9BAE] mb-8 max-w-[340px] mx-auto break-words">
              Invalid or missing reset code.
            </p>
            <button
              type="button"
              className="w-full mt-2 bg-[#4D18E8] text-white py-3 rounded-lg hover:bg-[#6931E0] transition-colors"
              onClick={handleBacktoLoginClick}
            >
              Back to sign in
            </button>
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
};

export default ResetPassword;
