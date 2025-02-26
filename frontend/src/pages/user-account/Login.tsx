import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../index.css";
import { useUser } from "../../contexts/UserContext";
import ErrorsSnackbar from "../../components/ErrorsSnackbar";
import useHandleError from "../../hooks/validation.hooks/useHandleError";
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

//import axios from "axios";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import {
  auth,
  googleProvider,
  getAdditionalInfo,
  db,
} from "../../services/firebase"; // Ensure you have this import for Firebase auth
// Icons
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

const Login = () => {
  const { setUser, user } = useUser(); // Get user from context
  const [data, setData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const { handleLoginError } = useHandleError();
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/dashboard/home"); // Redirect if user is authenticated
    }
  }, [user, navigate]);

  const togglePassword = () => {
    setShowPassword(!showPassword); // Toggle password visibility
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Login Component (handleGoogleSignIn)
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log(result);

      const token = await result.user.getIdToken();
      const additionalUserInfo = getAdditionalInfo(result);
      const userDoc = await getDoc(doc(db, "users", result.user.uid));

      if (userDoc.exists()) {
        const userData = {
          firebase_uid: result.user.uid,
          username: userDoc.data().username,
          email: userDoc.data().email,
          display_picture: userDoc.data().display_picture,
          isNew: additionalUserInfo?.isNewUser,
          full_name: userDoc.data().full_name,
          email_verified: userDoc.data().email_verified,
          isSSO: userDoc.data().isSSO,
          account_type: userDoc.data().account_type as "free" | "premium", // Ensure the value is either 'free' or 'premium'
        };
        console.log("User Data:", userData);

        // Store user data in context
        setUser(userData);

        // Optionally, you can store the token in local storage or context
        localStorage.setItem("userToken", token);

        setTimeout(() => {
          if (userData.isNew) {
            navigate("/dashboard/welcome");
          } else {
            navigate("/dashboard/home");
          }
        }, 2000);
      }
    } catch (error: any) {
      handleLoginError(error);
      setErrorMessage(error.message);
      setSnackbarOpen(true);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { username, password } = data;
    let email = username;

    try {
      if (!/\S+@\S+\.\S+/.test(username)) {
        try {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("username", "==", username));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            email = querySnapshot.docs[0].data().email;
          } else {
            handleLoginError({ code: "auth/user-not-found" });
            setErrorMessage("No account found with this email. Sign up first.");
            setSnackbarOpen(true);
            return;
          }
        } catch (firestoreError) {
          handleLoginError({ code: "auth/network-request-failed" });
          setErrorMessage("Network error. Please check your connection.");
          setSnackbarOpen(true);
          return;
        }
      }

      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("User Credential:", result);
      const token = await result.user.getIdToken();
      const additionalUserInfo = getAdditionalInfo(result);
      const userDoc = await getDoc(doc(db, "users", result.user.uid));

      if (userDoc.exists()) {
        const userData = {
          firebase_uid: result.user.uid,
          username: userDoc.data().username,
          email: userDoc.data().email,
          display_picture: userDoc.data().display_picture,
          isNew: additionalUserInfo?.isNewUser,
          full_name: userDoc.data().full_name,
          email_verified: userDoc.data().email_verified,
          isSSO: userDoc.data().isSSO,
          account_type: userDoc.data().account_type as "free" | "premium", // Ensure the value is either 'free' or 'premium'
        };
        console.log("User Data:", userData);

        // Store user data in context
        setUser(userData);

        // Optionally, you can store the token in local storage or context
        localStorage.setItem("userToken", token);

        setTimeout(() => {
          if (userData.isNew) {
            navigate("/dashboard/welcome");
          } else {
            navigate("/dashboard/home");
          }
        }, 2000);
      }
    } catch (error: any) {
      handleLoginError(error);
      setErrorMessage(error.message);
      setSnackbarOpen(true);
    }
  };

  return (
    <PageTransition>
      <div className="h-screen flex items-center justify-center ">
        {/* Simple Header */}
        <header className="absolute top-20 left-20 flex items-center">
          <Link to="/" className="flex items-center space-x-4">
            <img src="/duel-learn-logo.svg" className="w-10 h-10" alt="icon" />
            <p className="text-white text-xl font-semibold">Duel Learn</p>
          </Link>
        </header>

        <div className="w-full max-w-md  rounded-lg p-8 shadow-md">
          {/* Heading */}
          <h1 className="text-3xl font-bold text-center text-white mb-2">
            Login your Account
          </h1>
          <p className="text-lg text-center text-[#9F9BAE] mb-8">
            Please enter your details to login.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label htmlFor="username" className="sr-only">
                Username or Email
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={data.username}
                onChange={(e) => setData({ ...data, username: e.target.value })}
                placeholder="Enter your username or email"
                required
                className="w-full bg-[#3B354D] text-[#E2DDF3] placeholder-[#9F9BAE] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D18E8]"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                placeholder="Enter your password"
                required
                className="w-full bg-[#3B354D] text-[#E2DDF3] placeholder-[#9F9BAE] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D18E8]"
              />
              <span
                onClick={togglePassword}
                className="absolute right-3 top-3 text-[#9F9BAE] cursor-pointer"
              >
                {showPassword ? (
                  <VisibilityRoundedIcon />
                ) : (
                  <VisibilityOffRoundedIcon />
                )}
              </span>
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
              className="w-full bg-[#4D18E8] text-white py-3 rounded-lg hover:bg-[#6931E0] transition-colors"
            >
              Login
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-[#3B354D]"></div>
            <span className="text-sm text-[#9F9BAE] mx-3">or</span>
            <div className="flex-grow border-t border-[#3B354D]"></div>
          </div>

          {/* Google Sign-In */}
          <button
            className="w-full border border-[#4D18E8] bg-[#0F0A18] text-white py-3 rounded-lg flex items-center justify-center hover:bg-[#1A1426] transition-colors"
            onClick={handleGoogleSignIn}
          >
            <img
              src="/google-logo.png"
              className="w-5 h-5 mr-3"
              alt="Google Icon"
            />
            Sign in with Google
          </button>

          {/* Footer */}
          <p className="text-center text-sm text-[#9F9BAE] mt-6">
            Don't have an account?{" "}
            <Link to="/sign-up" className="text-[#4D18E8] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <ErrorsSnackbar
        open={snackbarOpen}
        message={errorMessage}
        onClose={handleSnackbarClose}
      />
    </PageTransition>
  );
};

export default Login;
