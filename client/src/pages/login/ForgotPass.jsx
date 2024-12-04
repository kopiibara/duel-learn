import { useNavigate } from "react-router-dom";
import ExitIcon from '../../assets/images/Exit.png';
import React, { useState } from "react";
import { TextField, CircularProgress } from "@mui/material";  // Import CircularProgress for the loading spinner
import axios from 'axios'; // Ensure axios is imported

const ForgotPass = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "", // Only email is used here
  });

  const [errors, setErrors] = useState({
    email: "",
  });

  const [error, setError] = useState({ general: "" }); // For general errors
  const [success, setSuccess] = useState(""); // For success messages
  const [loading, setLoading] = useState(false); // Loading state

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { email } = formData; // Only handle email for password recovery
    let formIsValid = true;
    let newErrors = { email: "" };

    // Validation for empty fields
    if (!email) {
      newErrors.email = "Email is required."; // Error message for email
      formIsValid = false;
    }

    // If form is not valid, set errors and stop form submission
    if (!formIsValid) {
      setErrors(newErrors);
      return;
    }

    setLoading(true); // Set loading to true when the form is being submitted

    try {
      const { data: response } = await axios.post(
        "/forgot-password", // Assuming you have an endpoint for this
        { email },
        { withCredentials: true } // Include credentials in the request
      );

      console.log("Server Response:", response);

      // Check if response contains a message or an error
      if (response && response.message) {
        // Success message for valid email
        setFormData({ email: "" }); // Clear form data on success
        setError({ general: "" }); // Reset general error on success
        navigate("/confirmation-account", { state: { email } });
      } else if (response && response.error) {
        // If the email is not found or other error, show an error message
        setError({ general: response.error }); // Use the dynamic error message from the backend
      } else {
        // Handle unexpected responses
        setError({ general: "An unexpected response was received from the server." });
      }

    } catch (error) {
      console.error("Server error:", error);
      // Handle different types of errors
      if (error.response) {
        // Handle server response errors (e.g., 4xx, 5xx)
        setError({ general: error.response.data.error || "Server error" }); // Use the dynamic error message from backend
      } else if (error.request) {
        // Handle no response received
        setError({ general: "No response from server. Please try again." });
      } else {
        // Handle any other error (e.g., configuration, setup)
        setError({ general: "An unexpected error occurred." });
      }
    } finally {
      setLoading(false); // Set loading to false after the request completes (whether success or error)
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
          Forgot Password
        </h1>
        <p className="text-[18px] text-center text-[#9F9BAE] mb-8 max-w-[340px] mx-auto break-words">
          Please enter your email or phone to search for your account.
        </p>

        {/* Error Message Box */}
        {error.general && (
          <div className="w-full max-w-sm mb-4 px-4 py-2 bg-red-100 text-red-600 rounded-md border border-red-300">
            {error.general}
          </div>
        )}

        {/* Success Message Box */}
        {success && (
          <div className="w-full max-w-sm mb-4 px-4 py-2 bg-green-100 text-green-600 rounded-md border border-green-300">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email or Phone Input */}
          <div className="mt-0 mb-0">
            <TextField
              id="email"
              label="Enter your email or phone"
              variant="filled"
              type="text"
              value={formData.email}
              autoComplete="off"
              onChange={(e) => handleInputChange("email", e.target.value)}
              error={!!errors.email} // Apply error state if there's an error
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

            {errors.email && (
              <div className="text-red-500 mb-3 text-sm mt-[-9px]">{errors.email}</div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-2 bg-[#4D18E8] text-white py-3 rounded-lg hover:bg-[#6931E0] transition-colors"
            disabled={loading} // Disable the button while loading
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: '#fff' }} /> // Show loading spinner
            ) : (
              "Submit"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPass;
