import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import axios from "axios";
import { toast } from "react-hot-toast";
import { auth, googleProvider } from "../../services/firebase";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase"; // Ensure you have this import for Firestore
import "../../index.css";
import { useUser } from "../../contexts/UserContext";

const SignUp = () => {
  const { setUser } = useUser();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    terms: false, // Add this to track the checkbox status
    passwordError: "",
    confirmPasswordError: "",
    usernameError: "",
    emailError: "",
    termsError: "", // Add this to track terms and conditions error
  });

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const validateForm = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent form submission by default
    setFormData((prev) => ({
      ...prev,
      passwordError: "",
      confirmPasswordError: "",
      usernameError: "",
      emailError: "",
      termsError: "", // Reset the terms error
    }));

    const { username, password, confirmPassword, email, terms } = formData;

    let hasError = false;

    // Username validation
    if (!username) {
      setFormData((prev) => ({
        ...prev,
        usernameError: "Username is required.",
      }));
      hasError = true;
    } else if (username.length < 6) {
      setFormData((prev) => ({
        ...prev,
        usernameError: "Username must be at least 6 characters.",
      }));
      hasError = true;
    } else if (username.length > 20) {
      setFormData((prev) => ({
        ...prev,
        usernameError: "Username cannot exceed 20 characters.",
      }));
      hasError = true;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setFormData((prev) => ({
        ...prev,
        usernameError:
          "Username can only contain alphanumeric characters and underscores.",
      }));
      hasError = true;
    }

    // Email validation
    if (!email) {
      setFormData((prev) => ({ ...prev, emailError: "Email is required." }));
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setFormData((prev) => ({
        ...prev,
        emailError: "Please enter a valid email address.",
      }));
      hasError = true;
    }

    // Password validation
    if (!password) {
      setFormData((prev) => ({
        ...prev,
        passwordError: "Password is required.",
      }));
      hasError = true;
    } else if (password.length < 8) {
      setFormData((prev) => ({
        ...prev,
        passwordError: "Password must be at least 8 characters.",
      }));
      hasError = true;
    } else if (!/[A-Z]/.test(password)) {
      setFormData((prev) => ({
        ...prev,
        passwordError: "Password must contain at least one uppercase letter.",
      }));
      hasError = true;
    } else if (!/[a-z]/.test(password)) {
      setFormData((prev) => ({
        ...prev,
        passwordError: "Password must contain at least one lowercase letter.",
      }));
      hasError = true;
    } else if (!/[0-9]/.test(password)) {
      setFormData((prev) => ({
        ...prev,
        passwordError: "Password must contain at least one number.",
      }));
      hasError = true;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setFormData((prev) => ({
        ...prev,
        passwordError: "Password must contain at least one special character.",
      }));
      hasError = true;
    }

    // Confirm Password validation
    if (!confirmPassword) {
      setFormData((prev) => ({
        ...prev,
        confirmPasswordError: "Please confirm your password.",
      }));
      hasError = true;
    } else if (confirmPassword !== password) {
      setFormData((prev) => ({
        ...prev,
        confirmPasswordError: "Passwords do not match.",
      }));
      hasError = true;
    }

    // Terms and Conditions validation
    if (!terms) {
      setFormData((prev) => ({
        ...prev,
        termsError: "You must agree to the terms and conditions.",
      }));
      hasError = true;
    }

    if (hasError) return; // Stop if there are errors

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("formData:", formData);

      console.log(userCredential);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
        dateCreated: serverTimestamp(),
      });
      await sendEmailVerification(userCredential.user);
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        terms: false,
        passwordError: "",
        confirmPasswordError: "",
        usernameError: "",
        emailError: "",
        termsError: "",
      });
      setSuccessMessage(
        "Account successfully created! Redirecting to login..."
      );
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      setFormData((prev) => ({ ...prev, emailError: (error as any).message }));
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log(result);
      const token = await result.user.getIdToken();

      // Handle user data directly on the frontend
      const userData = {
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        uid: result.user.uid,
      };
      console.log("User Data:", userData);

      // Store user data in context
      setUser(userData);

      // Optionally, you can store the token in local storage or context
      localStorage.setItem("userToken", token);

      // Redirect to a protected route or dashboard
      navigate("/dashboard/home");
    } catch (error) {
      console.error("Error during sign-in:", error);
      toast.error("Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className=" font-aribau min-h-screen flex items-center justify-center">
      <div className=" p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center text-[#E2DDF3]">
          Create an Account
        </h1>
        <p className="text-sm mb-8 text-center text-[#9F9BAE]">
          Please enter your details to sign up.
        </p>
        {successMessage && (
          <div className="bg-green-700 text-white text-center py-2 mb-4 rounded">
            {successMessage}
          </div>
        )}
        <form onSubmit={validateForm}>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Enter your username"
            required
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className="block w-full p-3 mb-4 rounded-lg bg-[#3B354D] text-[#9F9BAE] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4D18E8]"
          />
          {formData.usernameError && (
            <p className="text-red-500 mt-1 text-sm">
              {formData.usernameError}
            </p>
          )}

          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Enter your password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="block w-full p-3 rounded-lg bg-[#3B354D] text-[#9F9BAE] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4D18E8]"
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
            {formData.passwordError && (
              <p className="text-red-500 mt-1 text-sm">
                {formData.passwordError}
              </p>
            )}
          </div>

          <div className="relative mb-4">
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              required
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="block w-full p-3 rounded-lg bg-[#3B354D] text-[#9F9BAE] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4D18E8]"
            />
            {formData.confirmPasswordError && (
              <p className="text-red-500 mt-1 text-sm">
                {formData.confirmPasswordError}
              </p>
            )}
          </div>

          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="block w-full p-3 mb-6 rounded-lg bg-[#3B354D] text-[#9F9BAE] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4D18E8]"
          />
          {formData.emailError && (
            <p className="text-red-500 mt-1 text-sm">{formData.emailError}</p>
          )}

          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 text-[#4D18E8] bg-[#3B354D] border-gray-300 rounded focus:ring-2 focus:ring-[#4D18E8]"
              checked={formData.terms}
              onChange={(e) =>
                setFormData({ ...formData, terms: e.target.checked })
              }
            />
            <label htmlFor="terms" className="ml-2 text-[#9F9BAE] text-sm">
              I agree to{" "}
              <a
                href="#"
                className="text-[#4D18E8] underline hover:text-[#4D18E8]"
              >
                Terms and Conditions
              </a>
            </label>
          </div>
          {formData.termsError && (
            <p className="text-red-500 mt-1 text-sm">{formData.termsError}</p>
          )}
          {formData.termsError && (
            <p className="text-red-500 mt-1 text-sm">{formData.termsError}</p>
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

        {/* Google Sign-In */}
        <button
          className="w-full border border-[#4D18E8] bg-[#0F0A18] text-white py-3 rounded-lg flex items-center justify-center hover:bg-[#1A1426] transition-colors"
          onClick={handleGoogleSignIn}
        >
          Sign in with Google
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
  );
};

export default SignUp;
