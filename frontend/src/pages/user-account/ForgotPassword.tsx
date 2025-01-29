import { useNavigate } from "react-router-dom";
import ExitIcon from "../../assets/images/Exit.png";
import React, { useState } from "react";
import { TextField, CircularProgress } from "@mui/material";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
  });

  const [errors, setErrors] = useState({
    email: "",
  });

  const [error, setError] = useState({ general: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { email } = formData;
    let formIsValid = true;
    let newErrors = { email: "" };

    if (!email) {
      newErrors.email = "Email or phone is required.";
      formIsValid = false;
    }

    if (!formIsValid) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const usersRef = collection(db, "users");
      let q;

      // Check if the input is an email or phone number
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phonePattern = /^\d{10,15}$/;

      if (emailPattern.test(email)) {
        q = query(usersRef, where("email", "==", email));
      } else if (phonePattern.test(email)) {
        q = query(usersRef, where("phone", "==", email));
      } else {
        setError({ general: "Invalid email or phone format." });
        setLoading(false);
        return;
      }

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError({ general: "Account doesn't exist." });
      } else {
        navigate("/confirmation-account", { state: { email } });
      }
    } catch (error) {
      setError({ general: (error as any).message });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
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
          style={{ width: "39px" }}
          className="hover:scale-110 cursor-pointer"
          onClick={handleExitClick}
        />
      </div>

      <div className="w-full max-w-md rounded-lg p-8 shadow-md">
        <h1 className="text-[42px] font-bold text-center text-white mb-2">
          Forgot Password
        </h1>
        <p className="text-[18px] text-center text-[#9F9BAE] mb-8 max-w-[340px] mx-auto break-words">
          Please enter your email or phone to search for your account.
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
              label="Enter your email or phone"
              variant="filled"
              type="text"
              value={formData.email}
              autoComplete="off"
              onChange={(e) => handleInputChange("email", e.target.value)}
              error={!!errors.email}
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
                "& .MuiFilledInput-root": {
                  borderColor: errors.email ? "red" : "#9F9BAE",
                  "&:hover": {
                    borderColor: errors.email ? "red" : "#9F9BAE",
                  },
                },
              }}
            />

            {errors.email && (
              <div className="text-red-500 mb-3 text-sm mt-[-9px]">
                {errors.email}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-[#4D18E8] text-white py-3 rounded-lg hover:bg-[#6931E0] transition-colors"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : (
              "Submit"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
