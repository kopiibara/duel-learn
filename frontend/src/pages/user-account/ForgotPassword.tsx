import { Link, useNavigate } from "react-router-dom";
import ExitIcon from "../../assets/images/Exit.png";
import React, { useState } from "react";
import { CircularProgress, Modal } from "@mui/material";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import PageTransition from "../../styles/PageTransition";
import sampleAvatar2 from "../../assets/images/sampleAvatar2.png";
import useHandleForgotPasswordError from "../../hooks/validation.hooks/useHandleForgotPasswordError";
import useForgotPasswordValidation from "../../hooks/validation.hooks/useForgotPasswordValidation";
import { auth, sendResetEmail } from "../../services/firebase";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
  });

  const { errors, validate } = useForgotPasswordValidation(formData);
  const [loading, setLoading] = useState(false);
  const [isSSOModalOpen, setIsSSOModalOpen] = useState(false);
  const { error, handleForgotPasswordError, setError } =
    useHandleForgotPasswordError();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { email } = formData;
    let formIsValid = true;
    let newErrors = { email: "" };

    if (formIsValid && !errors.email) {
      try {
        setLoading(true);
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError("Account doesn't exist.");
        } else {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          if (userData.isSSO) {
            setIsSSOModalOpen(true);
          } else {
            navigate("/confirmation-account", {
              state: {
                email,
                type: "reset",
              },
            });
          }
        }
      } catch (error) {
        handleForgotPasswordError(error);
      } finally {
        setLoading(false);
      }
    } else {
      setError(newErrors.email);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
    validate(field, value);
    setError("");
  };

  const handleExitClick = () => {
    navigate("/login");
  };

  return (
    <PageTransition>
      <div className="h-screen mt-[-30px] flex flex-col items-center justify-center">
        <header className="absolute top-20 left-20 right-20 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-4">
            <img src="/duel-learn-logo.svg" className="w-10 h-10" alt="icon" />
            <p className="text-white text-xl font-semibold">Duel Learn</p>
          </Link>
        </header>

        <div className="w-full max-w-md rounded-lg p-8 shadow-md">
          <h1 className="text-3xl font-bold text-center text-white mb-2">
            Forgot Password
          </h1>
          <p className="text-lg text-center text-[#9F9BAE] mb-8 max-w-[340px] mx-auto break-words">
            Please enter your email to search for your account.
          </p>

          {error && (
            <div className="w-full max-w-sm mb-4 px-4 py-2 bg-red-100 text-red-600 rounded-md border border-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mt-0 mb-0">
              <input
                id="email"
                type="text"
                placeholder="Enter your email"
                value={formData.email}
                autoComplete="off"
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`block w-full p-3 mb-4 rounded-lg bg-[#3B354D] text-[#E2DDF3] placeholder-[#9F9BAE] focus:outline-none focus:ring-2 pr-12 ${
                  error || errors.email
                    ? "border border-red-500 focus:ring-red-500"
                    : "focus:ring-[#4D18E8]"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 mt-1 text-sm">{errors.email}</p>
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
            <button
              type="button"
              className="w-full mt-2 text-[#3B354D] py-3 rounded-lg  justify-center "
              onClick={handleExitClick}
            >
              <p className="hover:text-white transition-colors">Back</p>
            </button>
          </form>
        </div>
      </div>

      <Modal
        open={isSSOModalOpen}
        onClose={() => setIsSSOModalOpen(false)}
        aria-labelledby="sso-modal-title"
        aria-describedby="sso-modal-description"
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
              This account was created using Google. You cannot change the
              password.
            </p>
            <button
              type="button"
              className="w-full mt-2 bg-[#4D18E8] text-white py-3 rounded-lg hover:bg-[#6931E0] transition-colors"
              onClick={() => setIsSSOModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
};

export default ForgotPassword;
