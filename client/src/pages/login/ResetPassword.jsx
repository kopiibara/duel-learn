import { useNavigate, useLocation } from "react-router-dom";
import ExitIcon from '../../assets/images/Exit.png';
import React, {useEffect, useState } from "react";
import { TextField, InputAdornment, IconButton, CircularProgress  } from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { verifyPasswordResetCode, confirmPasswordReset, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../../config"; // Adjust the path as needed
import { collection, query, where, getDocs } from "firebase/firestore";

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { email } = location.state || {};
    useEffect(() => {
        const oobCode = new URLSearchParams(location.search).get("oobCode");
        if (!oobCode) {
          setError({ general: "Invalid or missing reset code." });
          setLoading(false);
          return;
        }
      
        const validateCode = async () => {
          try {
            await verifyPasswordResetCode(auth, oobCode);
          } catch (err) {
            setError({ general: "Reset code is invalid or expired." });
          } finally {
            setLoading(false);
          }
        };
        validateCode();
      }, [location.search]);
      

    console.log("Email received from location SecurityCode:", email);

    const [formData, setFormData] = useState({
        newpassword: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({
        newpassword: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const togglePassword = () => {
        setShowPassword(!showPassword);
    };
    const toggleConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const [error, setError] = useState({ general: "" });

    const handleSubmit = async (event) => {
        event.preventDefault();
        const { newpassword, confirmPassword } = formData;
        let formIsValid = true;
        
        if (!newpassword) {
            newErrors.newpassword = "Enter your new password.";
            formIsValid = false;
        } else if (newpassword.length < 8) {
            newErrors.newpassword = "Password must be at least 8 characters.";
            formIsValid = false;
        } else if (!/[A-Z]/.test(newpassword)) {
            newErrors.newpassword = "Password must contain at least one uppercase letter.";
            formIsValid = false;
        } else if (!/[a-z]/.test(newpassword)) {
            newErrors.newpassword = "Password must contain at least one lowercase letter.";
            formIsValid = false;
        } else if (!/[0-9]/.test(newpassword)) {
            newErrors.newpassword = "Password must contain at least one number.";
            formIsValid = false;
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(newpassword)) {
            newErrors.newpassword = "Password must contain at least one special character.";
            formIsValid = false;
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password.";
            formIsValid = false;
        } else if (newpassword !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
            formIsValid = false;
        }

        if (!formIsValid) {
            setErrors(newErrors);
            return;
          }
        
          setLoading(true);
          try {
            const oobCode = new URLSearchParams(location.search).get("oobCode");
            await confirmPasswordReset(auth, oobCode, newpassword);
            alert("Password successfully reset!");
            navigate("/login");
          } catch (err) {
            setError({ general: "Failed to reset password." });
          } finally {
            setLoading(false);
          }

        try {
            await confirmPasswordReset(auth, oobCode, password);
            alert("Password successfully reset! You can now log in with your new password.");
            onClose();
          } catch (err) {
            setError("Failed to reset the password. Please try again.");
            console.error("Error resetting password:", err);
          };
    };

    const handleInputChange = (field, value) => {
        setFormData((prevData) => ({ ...prevData, [field]: value }));
        setErrors((prevErrors) => ({ ...prevErrors, [field]: "" }));
        setError({ general: "" });
    };

    const handleExitClick = () => {
        navigate("/");
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
                <h1 className="text-[42px] font-bold text-center text-white mb-2">
                    Reset Password
                </h1>
                <p className="text-[18px] text-center text-[#9F9BAE] mb-8 max-w-[370px] mx-auto break-words">
                    Your new password must be different from your previously used password.
                </p>

                {error.general && (
                    <div className="w-full max-w-sm mb-4 px-4 py-2 bg-red-100 text-red-600 rounded-md border border-red-300">
                        {error.general}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
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
                                    handleSubmit(e);
                                }
                            }}
                            fullWidth
                            sx={{
                                width: '100%',
                                backgroundColor: '#3B354D',
                                color: '#E2DDF3',
                                marginBottom: '-3px',
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
                                '&:focus-within': {
                                    outline: 'none',
                                    boxShadow: '0 0 0 2px #4D18E8',
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
                                                    paddingRight: "18px",
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
                            error={!!errors.newpassword}
                        />
                        {errors.newpassword && (
                            <div className="text-red-500 text-sm mt-[-1px] mb-2">{errors.newpassword}</div>
                        )}
                    </div>

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
                                    handleSubmit(e);
                                }
                            }}
                            fullWidth
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
                                '&:focus-within': {
                                    outline: 'none',
                                    boxShadow: '0 0 0 2px #4D18E8',
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
                                                    paddingRight: "18px",
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
                            error={!!errors.confirmPassword}
                        />
                        {errors.confirmPassword && (
                            <div className="text-red-500 text-sm mt-[-1px] mb-2">{errors.confirmPassword}</div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#4D18E8] text-white py-3 rounded-md hover:bg-[#4D18E8] focus:ring-4 focus:ring-[#4D18E8]"
                        disabled={loading}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
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
