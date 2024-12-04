import { useNavigate, useLocation } from "react-router-dom";
import ExitIcon from '../../assets/images/Exit.png';
import React, { useState } from "react";
import { TextField, InputAdornment, IconButton, CircularProgress  } from "@mui/material";
import axios from 'axios'; // Ensure axios is imported
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Get location object
    // Retrieve the email passed from the previous page
    const { email } = location.state || {};

    console.log("Email received from location SecurityCode:", email); // Check if email is properly received

    const [formData, setFormData] = useState({
        newpassword: "", // Only password is used here
        confirmPassword: "", // New field for confirming password
    });

    const [errors, setErrors] = useState({
        newpassword: "",
        confirmPassword: "", // Error for confirm password
    });

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

    const handleSubmit = async (event) => {
        event.preventDefault();
        const { newpassword, confirmPassword } = formData; // Get new password and confirm password
        let formIsValid = true;
        let newErrors = { newpassword: "", confirmPassword: "" };

        // Password validation
        if (!newpassword) {
            newErrors.newpassword = "Enter your new password."; // Error message for password
            formIsValid = false;
        } else if (newpassword.length < 8) {
            newErrors.newpassword = "Password must be at least 8 characters."; // Password length validation
            formIsValid = false;
        } else if (!/[A-Z]/.test(newpassword)) {
            newErrors.newpassword = "Password must contain at least one uppercase letter."; // Uppercase letter validation
            formIsValid = false;
        } else if (!/[a-z]/.test(newpassword)) {
            newErrors.newpassword = "Password must contain at least one lowercase letter."; // Lowercase letter validation
            formIsValid = false;
        } else if (!/[0-9]/.test(newpassword)) {
            newErrors.newpassword = "Password must contain at least one number."; // Number validation
            formIsValid = false;
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(newpassword)) {
            newErrors.newpassword = "Password must contain at least one special character."; // Special character validation
            formIsValid = false;
        }

        // Confirm Password validation
        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password."; // Error if confirm password is empty
            formIsValid = false;
        } else if (newpassword !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match."; // Error if passwords do not match
            formIsValid = false;
        }

        // If form is not valid, set errors and stop form submission
        if (!formIsValid) {
            setErrors(newErrors);
            return;
        }

        setLoading(true); // Start loading spinner


        try {
            const response = await axios.post(
                "/reset-password", // Assuming you have an endpoint for this
                { email, newpassword },
                { withCredentials: true } // Include credentials in the request
            );

            if (response.data.error) {
                // Set general error if something goes wrong with the request
                setError({ general: "Invalid input. Please check your information." });
            } else {
                setFormData({ newpassword: "", confirmPassword: "" }); // Clear form data on success
                setError({ general: "" }); // Reset general error on success
                navigate("/success-reset-password"); // Redirect to a success page or wherever
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
                    Reset Password
                </h1>
                <p className="text-[18px] text-center text-[#9F9BAE] mb-8 max-w-[370px] mx-auto break-words">
                    Your new password must be different from your previously used password.
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
                    <div className="mb-4">
                        <TextField
                            id="password-field"
                            label="New password"
                            variant="filled"
                            type={showPassword ? "text" : "password"}
                            value={formData.newpassword}
                            onChange={(e) => handleInputChange("newpassword", e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSubmit(e); // Submit form when Enter is pressed in password field
                                }
                            }}
                            fullWidth
                            sx={{
                                width: '100%',
                                backgroundColor: '#3B354D', // Maintain background color even when focused
                                color: '#E2DDF3',
                                marginBottom: '-3px',
                                borderRadius: '8px',
                                '& .MuiInputBase-root': {
                                    color: '#E2DDF3', // Text color
                                    backgroundColor: '#3B354D', // Background color
                                    borderRadius: '8px',
                                    '&:hover': {
                                        backgroundColor: '#3B354D', // Keep the same background color on hover
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: '#3B354D', // Keep the background color when focused
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#9F9BAE', // Label color
                                },
                                '& .MuiInput-underline:before': {
                                    borderBottomColor: '#9F9BAE', // Initial border color
                                },
                                '& .MuiInput-underline:after': {
                                    borderBottomColor: '#4D18E8', // Border color when focused
                                },
                                '&:focus-within': {
                                    outline: 'none',
                                    boxShadow: '0 0 0 2px #4D18E8', // Focus ring when the input is focused
                                },
                            }}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={togglePassword}
                                                sx={{
                                                    color: "#9F9BAE",
                                                    paddingRight: "18px", // Add padding to the right side
                                                }}
                                                edge="end"
                                            >
                                                {showPassword ? (
                                                    <VisibilityRoundedIcon />
                                                ) : (
                                                    <VisibilityOffRoundedIcon />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            error={!!errors.newpassword} // Show error style when there's an error
                        />
                        {errors.newpassword && (
                            <div className="text-red-500 text-sm mt-[-1px] mb-2">{errors.newpassword}</div>
                        )}
                    </div>

                    {/* Confirm Password Input */}
                    <div className="mb-4">
                        <TextField
                            id="confirm-password-field"
                            label="Confirm password"
                            variant="filled"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSubmit(e); // Submit form when Enter is pressed in confirm password field
                                }
                            }}
                            fullWidth
                            sx={{
                                width: '100%',
                                backgroundColor: '#3B354D', // Maintain background color even when focused
                                color: '#E2DDF3',
                                marginBottom: '14px',
                                borderRadius: '8px',
                                '& .MuiInputBase-root': {
                                    color: '#E2DDF3', // Text color
                                    backgroundColor: '#3B354D', // Background color
                                    borderRadius: '8px',
                                    '&:hover': {
                                        backgroundColor: '#3B354D', // Keep the same background color on hover
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: '#3B354D', // Keep the background color when focused
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#9F9BAE', // Label color
                                },
                                '& .MuiInput-underline:before': {
                                    borderBottomColor: '#9F9BAE', // Initial border color
                                },
                                '& .MuiInput-underline:after': {
                                    borderBottomColor: '#4D18E8', // Border color when focused
                                },
                                '&:focus-within': {
                                    outline: 'none',
                                    boxShadow: '0 0 0 2px #4D18E8', // Focus ring when the input is focused
                                },
                            }}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={toggleConfirmPassword}
                                                sx={{
                                                    color: "#9F9BAE",
                                                    paddingRight: "18px", // Add padding to the right side
                                                }}
                                                edge="end"
                                            >
                                                {showConfirmPassword ? (
                                                    <VisibilityRoundedIcon />
                                                ) : (
                                                    <VisibilityOffRoundedIcon />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            error={!!errors.confirmPassword} // Show error style when there's an error
                        />
                        {errors.confirmPassword && (
                            <div className="text-red-500 text-sm mt-[-1px] mb-2">{errors.confirmPassword}</div>
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
    );
};

export default ResetPassword;
