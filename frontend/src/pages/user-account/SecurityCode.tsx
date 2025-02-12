import { useNavigate, useLocation } from "react-router-dom";
import ExitIcon from "../../assets/images/Exit.png";
import { useState } from "react";
import { TextField } from "@mui/material";
import axios from "axios"; // Ensure axios is imported
import PageTransition from "../../styles/PageTransition";

const SecurityCode = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get location object
  // Retrieve the email passed from the previous page
  const { email } = location.state || {};
  console.log("Email received from location:", email); // Check if email is properly received

  const [formData, setFormData] = useState({
    code: "",
    email: email || "", // Ensure email is correctly initialized
  });

  const [errors, setErrors] = useState({
    code: "",
  });

  const [error, setError] = useState({ general: "" }); // For general errors
  const [buttonLoading, setButtonLoading] = useState(false); // Button loading state

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const { code, email } = formData;
    let isValid = true;
    let newErrors = { code: "" };

    // Validation
    if (!code) {
      newErrors.code = "Please enter the security code.";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    setButtonLoading(true);

    console.log("Submitting data:", { email, code }); // Check the values for debugging

    try {
      // Send email and code to the backend for verification
      const response = await axios.post("/security-code", { email, code });

      if (response.data.success) {
        navigate("/reset-password", { state: { email } }); // Navigate on success, pass email
      } else {
        // Display an error message if the security code is invalid
        setError(
          response.data.message || "Invalid security code. Please try again."
        );
      }
    } catch (error) {
      setError({ general: "Server error. Please try again later." });
      console.error("Error verifying code:", error);
    } finally {
      setButtonLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Update the input value
    setFormData((prevData) => ({ ...prevData, [field]: value }));

    // Only reset the specific field's error
    setErrors((prevErrors) => ({ ...prevErrors, [field]: "" }));

    // Clear the general error when typing in either field
    setError({ general: "" });
  };
  const handleExitClick = () => {
    navigate("/"); // Navigate to home when the exit icon is clicked
  };

  return (
    <PageTransition>
      <div className="h-screen mt-[-30px] flex flex-col items-center justify-center">
        <div className="w-[430px] sm:w-[500px] md:w-[700px] lg:w-[800px] pb-6 text-right flex justify-end">
          <img
            src={ExitIcon}
            alt="Exit Icon"
            style={{ width: "39px" }}
            className="hover:scale-110 cursor-pointer"
            onClick={handleExitClick}
          />
        </div>

        <div className="w-full max-w-md rounded-lg p-8 shadow-md">
          {/* Heading */}
          <h1 className="text-[42px] font-bold text-center text-white mb-2">
            Enter Code
          </h1>
          <p className="text-[18px] text-center text-[#9F9BAE] mb-8 max-w-[340px] mx-auto break-words">
            Please enter the security code we’ve sent to your email.{" "}
          </p>

          {/* Error Message Box */}
          {error.general && (
            <div className="w-full max-w-sm mb-4 px-4 py-2 bg-red-100 text-red-600 rounded-md border border-red-300">
              {error.general}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email or Phone Input */}
            <div className="mt-0 mb-0">
              <TextField
                id="email"
                label="Enter code"
                variant="filled"
                type="text"
                value={formData.code}
                autoComplete="off"
                onChange={(e) => handleInputChange("code", e.target.value)}
                error={!!errors.code} // Apply error state if there's an error
                sx={{
                  width: "100%",
                  backgroundColor: "#3B354D",
                  color: "#E2DDF3",
                  marginBottom: "14px",
                  borderRadius: "8px",
                  "& .MuiInputBase-root": {
                    color: "#E2DDF3",
                    backgroundColor: "#3B354D",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "#3B354D",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "#3B354D",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#9F9BAE",
                  },
                  "& .MuiInput-underline:before": {
                    borderBottomColor: "#9F9BAE",
                  },
                  "& .MuiInput-underline:after": {
                    borderBottomColor: "#4D18E8",
                  },
                  // Apply error styles if there's an error
                  "& .MuiFilledInput-root": {
                    borderColor: errors.code ? "red" : "#9F9BAE", // Border color when there's an error
                    "&:hover": {
                      borderColor: errors.code ? "red" : "#9F9BAE", // Border color on hover when there's an error
                    },
                  },
                }}
              />

              {errors.code && (
                <div className="text-red-500 mb-3 text-sm mt-[-9px]">
                  {errors.code}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-2 bg-[#4D18E8] text-white py-3 rounded-lg hover:bg-[#6931E0] transition-colors flex justify-center items-center"
            >
              {buttonLoading ? (
                <div className="loader border-2 border-t-2 border-white rounded-full w-6 h-6 animate-spin"></div>
              ) : (
                "Verify"
              )}
            </button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
};

export default SecurityCode;
