import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { auth } from "../../services/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import "../../index.css";
import PageTransition from "../../styles/PageTransition";
import useCombinedErrorHandler from "../../hooks/validation.hooks/useCombinedErrorHandler";
import LoadingScreen from "../../components/LoadingScreen";
import { useFormik } from "formik";
import * as Yup from "yup";
import useGoogleAuth from "../../hooks/auth.hooks/useGoogleAuth";
import { useStoreUser } from '../../hooks/api.hooks/useStoreUser';
import { useUser } from "../../contexts/UserContext";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const SignUp = () => {
  const { handleError, combinedError } = useCombinedErrorHandler();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { storeUser } = useStoreUser();
  const { handleGoogleAuth, loading: googleLoading } = useGoogleAuth();
  const { loginAndSetUserData } = useUser();

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Add functions to check uniqueness
  const checkUsernameUnique = async (username: string) => {
    const db = getFirestore();
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  };

  const checkEmailUnique = async (email: string) => {
    const db = getFirestore();
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  };

  const validationSchema = Yup.object({
    username: Yup.string()
      .required("Username is required.")
      .min(8, "Username must be at least 8 characters.")
      .max(20, "Username cannot exceed 20 characters.")
      .matches(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores.")
      .test("unique", "Username is already taken", async function(value) {
        if (!value) return true; // Skip if empty as required() will handle it
        try {
          return await checkUsernameUnique(value);
        } catch (error) {
          return false;
        }
      }),
    email: Yup.string()
      .required("Email is required.")
      .email("Please enter a valid email address.")
      .test("unique", "Email is already in use", async function(value) {
        if (!value) return true; // Skip if empty as required() will handle it
        try {
          return await checkEmailUnique(value);
        } catch (error) {
          return false;
        }
      }),
    password: Yup.string()
      .required("Password is required.")
      .min(8, "Password must be at least 8 characters.")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter.")
      .matches(/[0-9]/, "Password must contain at least one number.")
      .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character."),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], "Passwords must match").required("Please confirm your password."),
    terms: Yup.boolean().oneOf([true], "You must agree to the terms and conditions."),
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      terms: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        console.log("=== Starting SignUp Process ===");
        console.log("Creating Firebase user...");
        const result = await createUserWithEmailAndPassword(auth, values.email, values.password);
        console.log("Firebase user created:", result.user.uid);
        
        await updateProfile(result.user, { displayName: values.username });
        console.log("Firebase profile updated");
    
        const token = await result.user.getIdToken();
        console.log("Got Firebase token");
        
        // Store user data in backend
        console.log("Calling storeUser with data:", {
          username: values.username,
          email: values.email,
          password: "***"
        });

        const storeUserResult = await storeUser({
          username: values.username,
          email: values.email,
          password: values.password,
          account_type: "free",
        }, token);
        console.log("Store user result:", storeUserResult);

        if (!storeUserResult.success) {
          throw new Error(storeUserResult.error);
        }
    
        const userData = {
          email: values.email,
          username: values.username,
          email_verified: false,
          firebase_uid: result.user.uid,
          isNew: true,
        };
        localStorage.setItem("userData", JSON.stringify(userData));

        setSuccessMessage("Account created! Please verify your email.");

        setTimeout(() => {
          console.log("Navigating to verify-email");
          navigate("/verify-email", { state: { token } });
        }, 2000);

      } catch (error) {
        console.error("Registration error:", error);
        handleError(error);
        setLoading(false);
      }
    }
  });

  const handleGoogleSubmit = async () => {
    try {
      const authResult = await handleGoogleAuth("free");
      
      // Fetch and update user data using the new hook
      await loginAndSetUserData(authResult.userData.uid, authResult.token);

      if (authResult.isNewUser) {
        setSuccessMessage("Account created successfully!");
        setTimeout(() => navigate("/dashboard/welcome"), 1500);
      } else {
        setSuccessMessage("Account already exists. Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (error) {
      handleError(error);
    }
  };

  if (loading || googleLoading) {
    return (
      <PageTransition>
        <LoadingScreen />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="font-aribau min-h-screen flex items-center justify-center">
        <header className="absolute top-20 left-20 flex items-center">
          <Link to="/" className="flex items-center space-x-4">
            <img src="/duel-learn-logo.svg" className="w-10 h-10" alt="icon" />
            <p className="text-white text-xl font-semibold">Duel Learn</p>
          </Link>
        </header>
        <div className="p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-3xl font-bold mb-2 text-center text-[#E2DDF3]">
            Create an Account
          </h1>
          <p className="text-lg mb-8 text-center text-[#9F9BAE]">
            Please enter your details to sign up.
          </p>
          {successMessage && (
            <div className="bg-green-700 text-white text-center py-2 mb-4 rounded">
              {successMessage}
            </div>
          )}

          {combinedError && (
            <div className="bg-red-700 text-white text-center py-2 mb-4 rounded">
              {combinedError}
            </div>
          )}

          <form onSubmit={formik.handleSubmit}>
            <div className="relative mb-4">
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter your username"
                required
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`block w-full p-3 rounded-lg bg-[#3B354D] text-[#9F9BAE] placeholder-gray-500 focus:outline-none focus:ring-2 ${
                  formik.touched.username && formik.errors.username
                    ? "border border-red-500 focus:ring-red-500"
                    : "focus:ring-[#4D18E8]"
                }`}
              />
              {formik.touched.username && formik.errors.username && (
                <p className="text-red-500 mt-1 text-sm">{formik.errors.username}</p>
              )}
            </div>
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter your password"
                required
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                onCopy={(e) => e.preventDefault()}
                className={`block w-full p-3 rounded-lg bg-[#3B354D] text-[#9F9BAE] placeholder-gray-500 focus:outline-none focus:ring-2 ${
                  formik.touched.password && formik.errors.password
                    ? "border border-red-500 focus:ring-red-500"
                    : "focus:ring-[#4D18E8]"
                }`}
              />
              <span
                onClick={togglePassword}
                className="absolute top-3 right-3 text-[#9F9BAE] cursor-pointer"
              >
                {showPassword ? (
                  <VisibilityRoundedIcon />
                ) : (
                  <VisibilityOffRoundedIcon />
                )}
              </span>
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 mt-1 text-sm">{formik.errors.password}</p>
              )}
            </div>
            <div className="relative mb-4">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                required
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                onPaste={(e) => e.preventDefault()}
                className={`block w-full p-3 rounded-lg bg-[#3B354D] text-[#9F9BAE] placeholder-gray-500 focus:outline-none focus:ring-2 ${
                  formik.touched.confirmPassword && formik.errors.confirmPassword
                    ? "border border-red-500 focus:ring-red-500"
                    : "focus:ring-[#4D18E8]"
                }`}
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-red-500 mt-1 text-sm">{formik.errors.confirmPassword}</p>
              )}
            </div>
            <div className="relative mb-4">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                required
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`block w-full p-3 rounded-lg bg-[#3B354D] text-[#9F9BAE] placeholder-gray-500 focus:outline-none focus:ring-2 ${
                  formik.touched.email && formik.errors.email
                    ? "border border-red-500 focus:ring-red-500"
                    : "focus:ring-[#4D18E8]"
                }`}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 mt-1 text-sm">{formik.errors.email}</p>
              )}
            </div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                className="w-4 h-4 text-[#4D18E8] bg-[#3B354D] border-gray-300 rounded focus:ring-2 focus:ring-[#4D18E8]"
                checked={formik.values.terms}
                onChange={formik.handleChange}
              />
              <label htmlFor="terms" className="ml-2 text-[#9F9BAE] text-sm">
                I agree to {""}
                <Link
                  to="/terms-and-conditions"
                  target="_blank"
                  className="text-[#4D18E8] underline hover:text-[#4D18E8]"
                >
                  Terms and Conditions
                </Link>
              </label>
            </div>
            {formik.touched.terms && formik.errors.terms && (
              <p className="text-red-500 mt-1 text-sm">{formik.errors.terms}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 text-white bg-[#4D18E8] rounded-lg hover:bg-[#3814b6] focus:outline-none focus:ring-4 focus:ring-[#4D18E8]"
            >
              Create Account
            </button>
          </form>

          <div className="flex items-center my-6">
            <hr className="flex-grow border-t border-[#9F9BAE]" />
            <span className="mx-2 text-[#9F9BAE]">or</span>
            <hr className="flex-grow border-t border-[#9F9BAE]" />
          </div>

          <button
            className="w-full border border-[#4D18E8] bg-[#0F0A18] text-white py-3 rounded-lg flex items-center justify-center hover:bg-[#1A1426] transition-colors"
            onClick={handleGoogleSubmit}
          >
            <img
              src="/google-logo.png"
              className="w-5 h-5 mr-3"
              alt="Google Icon"
            />
            Sign up with Google
          </button>

          <p className="mt-4 text-center text-sm text-[#9F9BAE]">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#4D18E8] hover:underline"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default SignUp;
