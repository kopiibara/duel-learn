import { useNavigate } from "react-router-dom";
import ExitIcon from '../../assets/images/Exit.png';
import React, { useState } from "react";
import { TextField } from "@mui/material";
import axios from 'axios'; // Ensure axios is imported

const SecurityCode = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    code: "", // Only email is used here
  });

  const [errors, setErrors] = useState({
    code: "",
  });

  const [error, setError] = useState({ general: "" }); // For general errors

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { email } = formData; // Only handle email for password recovery
    let formIsValid = true;
    let newErrors = { code: "" };

    // Validation for empty fields
    if (!email) {
      newErrors.code = "Enter your Code."; // Error message for email
      formIsValid = false;
    }

    // If form is not valid, set errors and stop form submission
    if (!formIsValid) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await axios.post(
        "/security-code", // Assuming you have an endpoint for this
        { email },
        { withCredentials: true } // Include credentials in the request
      );

      if (response.data.error) {
        // Set general error if something goes wrong with the request
        setError({ general: "Invalid input. Please check your information." });
      } else {
        setFormData({ email: "" }); // Clear form data on success
        setError({ general: "" }); // Reset general error on success
        navigate("/reset-password"); // Redirect to a reset page (or wherever)
      }
    } catch (error) {
      setError({ general: "Server error. Please try again later." }); // Handle server error
      console.error("Server error:", error); // Handle server error
    }
  };

  const handleInputChange = (field, value) => {
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
    <div className="h-screen mt-[-30px] flex flex-col items-center justify-center">
      <div className="w-[430px] sm:w-[500px] md:w-[700px] lg:w-[800px] pb-6 text-right flex justify-end">
        <img
          src={ExitIcon}
          alt="Exit Icon"
          style={{ width: '39px' }}
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
        Please enter the security code we’ve sent to your email.        </p>

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
              value={formData.email}
              autoComplete="off"
              onChange={(e) => handleInputChange("code", e.target.value)}
              error={!!errors.code} // Apply error state if there's an error
              sx={{
                width: '100%',
                backgroundColor: '#3B354D',
                color: '#E2DDF3',
                marginBottom: '14px',
                borderRadius: '8px',
                '& .MuiInputBase-root': {
                  color: '#E2DDF3',
                  backgroundColor: '#3B354D',
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: '#3B354D',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#3B354D',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#9F9BAE',
                },
                '& .MuiInput-underline:before': {
                  borderBottomColor: '#9F9BAE',
                },
                '& .MuiInput-underline:after': {
                  borderBottomColor: '#4D18E8',
                },
                // Apply error styles if there's an error
                '& .MuiFilledInput-root': {
                  borderColor: errors.email ? 'red' : '#9F9BAE', // Border color when there's an error
                  '&:hover': {
                    borderColor: errors.email ? 'red' : '#9F9BAE', // Border color on hover when there's an error
                  },
                },
              }}
            />

            {errors.code && (
              <div className="text-red-500 mb-3 text-sm mt-[-9px]">{errors.code}</div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-2 bg-[#4D18E8] text-white py-3 rounded-lg hover:bg-[#6931E0] transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default SecurityCode;
