import { useNavigate, useLocation } from "react-router-dom";
import ExitIcon from '../../assets/images/Exit.png';
import React, { useState } from "react";
import { TextField } from "@mui/material";

const SecurityCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};
  console.log("Email received from location:", email);

  const [formData, setFormData] = useState({
    code: "",
    email: email || "",
  });

  const [errors, setErrors] = useState({
    code: "",
  });

  const [error, setError] = useState({ general: "" });
  const [buttonLoading, setButtonLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const { code } = formData;
    let isValid = true;
    let newErrors = { code: "" };

    if (!code) {
      newErrors.code = "Please enter the security code.";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    setButtonLoading(true);

    console.log("Submitting data:", { email, code });

    // Simulate successful verification
    setTimeout(() => {
      setButtonLoading(false);
      navigate("/reset-password", { state: { email } });
    }, 1000);
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
          Enter Code
        </h1>
        <p className="text-[18px] text-center text-[#9F9BAE] mb-8 max-w-[340px] mx-auto break-words">
          Please enter the security code we’ve sent to your email.
        </p>

        {error.general && (
          <div className="w-full max-w-sm mb-4 px-4 py-2 bg-red-100 text-red-600 rounded-md border border-red-300">
            {error.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mt-0 mb-0">
            <TextField
              id="email"
              label="Enter code"
              variant="filled"
              type="text"
              value={formData.code}
              autoComplete="off"
              onChange={(e) => handleInputChange("code", e.target.value)}
              error={!!errors.code}
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
                '& .MuiFilledInput-root': {
                  borderColor: errors.email ? 'red' : '#9F9BAE',
                  '&:hover': {
                    borderColor: errors.email ? 'red' : '#9F9BAE',
                  },
                },
              }}
            />

            {errors.code && (
              <div className="text-red-500 mb-3 text-sm mt-[-9px]">{errors.code}</div>
            )}
          </div>

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
  );
};

export default SecurityCode;
