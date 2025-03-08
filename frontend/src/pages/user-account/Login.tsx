import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../index.css";
import { useUser } from "../../contexts/UserContext";
import useCombinedErrorHandler from "../../hooks/validation.hooks/useCombinedErrorHandler";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import PageTransition from "../../styles/PageTransition";
import useGoogleAuth from "../../hooks/auth.hooks/useGoogleAuth";
import useUserData from "../../hooks/api.hooks/useUserData";
import LoadingScreen from "../../components/LoadingScreen";
import { useFormik } from "formik";
import * as Yup from "yup";

//import axios from "axios";
import { signInWithEmailAndPassword} from "firebase/auth";
import {
  auth,
  getAdditionalInfo,
  db,
} from "../../services/firebase"; // Ensure you have this import for Firebase auth
// Icons
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

const Login = () => {
  const { setUser, user } = useUser(); // Get user from context
  const { handleError, combinedError } = useCombinedErrorHandler();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [successMessage, setSuccessMessage] = useState("");
  const { handleGoogleAuth, loading: googleLoading } = useGoogleAuth();
  const { fetchAndUpdateUserData, loading: userDataLoading } = useUserData();
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in
  if (user) {
    const confirmed = window.confirm("You are already logged in. Would you like to log out?");
    if (confirmed) {
      auth.signOut();
    } else {
      navigate("/dashboard/home");
      return null; // Return early to prevent rendering the login form
    }
  }

  const togglePassword = () => {
    setShowPassword(!showPassword); // Toggle password visibility
  };

  const validationSchema = Yup.object({
    username: Yup.string()
      .required("Username or email is required."),
    password: Yup.string()
      .required("Password is required.")
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      let email = values.username;

      try {
        if (!/\S+@\S+\.\S+/.test(values.username)) {
          // If username is not an email, fetch email from user collection
          const db = getFirestore();
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("username", "==", values.username));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            email = email;
          } else {
            throw new Error("Username not found");
          }
        }
        
        const result = await signInWithEmailAndPassword(auth, email, values.password);
        const token = await result.user.getIdToken();

        // Fetch and update user data using the new hook
        const userData = await fetchAndUpdateUserData(result.user.uid, token);
        
        if (userData.isNew) {
          setSuccessMessage("Account created successfully!");
        }

        // Navigate based on user status
        setTimeout(() => {
          if (userData.account_type === "admin") {
            navigate("/admin/admin-dashboard");
          } else if (userData.isNew && userData.email_verified) {
            navigate("/dashboard/welcome");
          } else if (!userData.email_verified) {
            navigate("/dashboard/verify-email", { state: { token } });
          } else {
            navigate("/dashboard/home");
          }
        }, 2000);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    }
  });

  const googleSubmit = async () => {
    try {
      const authResult = await handleGoogleAuth();
      
      // Fetch and update user data using the new hook
      const userData = await fetchAndUpdateUserData(authResult.userData.uid, authResult.token);

      if (userData.isNew) {
        setSuccessMessage("Account created successfully!");
      }

      setTimeout(() => {
        if (userData.isNew && userData.email_verified) {
          navigate("/dashboard/welcome");
        } else if (!userData.email_verified) {
          navigate("/dashboard/verify-email", { state: { token: authResult.token } });
        } else {
          navigate("/dashboard/home");
        }
      }, 2000);
    } catch (error) {
      handleError(error);
    }
  };

  if (loading || googleLoading || userDataLoading) {
    return (
      <PageTransition>
        <LoadingScreen />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="font-aribau min-h-screen flex items-center justify-center">
        {/* Simple Header */}
        <header className="absolute top-20 left-20 flex items-center">
          <Link to="/" className="flex items-center space-x-4">
            <img src="/duel-learn-logo.svg" className="w-10 h-10" alt="icon" />
            <p className="text-white text-xl font-semibold">Duel Learn</p>
          </Link>
        </header>

        <div className="w-full max-w-md  rounded-lg p-8 shadow-md">
          {/* Heading */}
          <h1 className="text-3xl font-bold text-center text-[#E2DDF3] mb-2">
            Login your Account
          </h1>
          <p className="text-lg text-center text-[#9F9BAE] mb-8">
            Please enter your details to login.
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
          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="relative mb-4">
              <label htmlFor="username" className="sr-only">
                Username or Email
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your username or email"
                required
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

            {/* Password Input */}
            <div className="relative mb-4">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your password"
                required
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

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-[#9F9BAE] hover:text-[#E2DDF3]"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3 text-white bg-[#4D18E8] rounded-lg hover:bg-[#3814b6] focus:outline-none focus:ring-4 focus:ring-[#4D18E8]"
            >
              Login
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="flex-grow border-t border-[#9F9BAE]" />
            <span className="mx-2 text-[#9F9BAE]">or</span>
            <hr className="flex-grow border-t border-[#9F9BAE]" />
          </div>

          {/* Google Sign-In */}
          <button
            className="w-full border border-[#4D18E8] bg-[#0F0A18] text-white py-3 rounded-lg flex items-center justify-center hover:bg-[#1A1426] transition-colors"
            onClick={googleSubmit}
          >
            <img
              src="/google-logo.png"
              className="w-5 h-5 mr-3"
              alt="Google Icon"
            />
            Sign in with Google
          </button>

          {/* Footer */}
          <p className="mt-4 text-center text-sm text-[#9F9BAE]">
            Don't have an account?{" "}
            <Link to="/sign-up" className="text-[#4D18E8] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default Login;
