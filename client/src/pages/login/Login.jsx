import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../index.css";
import googleIcon from "../../assets/images/googleIcon.png";
import { TextField, IconButton, InputAdornment } from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import ExitIcon from "../../assets/images/Exit.png";
import { auth, signIn, googleProvider,sendEmail } from "../../config";
import { signInWithPopup } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, setDoc, doc, serverTimestamp } from "firebase/firestore";

const Login = () => {
  const [data, setData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState({ general: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.head.appendChild(document.createElement("meta")).httpEquiv = "Cross-Origin-Opener-Policy";
    document.head.appendChild(document.createElement("meta")).content = "same-origin-allow-popups";
  }, []);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { username, password } = data;
    let formIsValid = true;
    let newErrors = { username: "", password: "" };

    if (!username) {
      newErrors.username = "Username or email is required.";
      formIsValid = false;
    }
    if (!password) {
      newErrors.password = "Password is required.";
      formIsValid = false;
    }

    if (!formIsValid) {
      setErrors(newErrors);
      return;
    }

    const db = getFirestore();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailRegex.test(username)) {
      signIn(auth, username, password)
        .then((userCredential) => {
          const user = userCredential.user;
          if (!user.emailVerified) {
            sendEmail(userCredential.user);
            setError({ general: "Please verify your email. A verification email has been sent." });
          } else {
           // sendEmail(userCredential.user);
            navigate("/dashboard");
            
          }
        })
        .catch(() => {
          setError({ general: "Invalid email or password." });
        });
    } else {
      const q = query(collection(db, "users"), where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError({ general: "Invalid username or password." });
        return;
      }

      let email = "";
      querySnapshot.forEach((doc) => {
        email = doc.data().email;
      });

      signIn(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          if (!user.emailVerified) {
            sendEmail(userCredential.user);
            setError({ general: "Please verify your email. A verification email has been sent." });
            
          } else {
            //sendEmail(userCredential.user);
            navigate("/dashboard");
          }
        })
        .catch(() => {
          setError({ general: "Invalid username or password." });
        });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Sign in with Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
  
      // Ensure user is valid
      if (!user || !user.email) {
        setError({ general: "Google sign-in failed. Missing email or user data." });
        return;
      }
  
      const db = getFirestore();
  
      // Query Firestore for existing user
      const q = query(collection(db, "users"), where("email", "==", user.email));
      const querySnapshot = await getDocs(q);
  
      // Fetch profile picture as Base64
      const fetchProfilePicBase64 = async (url) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch profile picture.");
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result); // Base64 string
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      };
  
      // Prepare profile picture Base64 (if available)
      let profilePicBase64 = null;
      if (user.photoURL) {
        profilePicBase64 = await fetchProfilePicBase64(user.photoURL);
      }
  
      // Check if user exists in Firestore
      if (querySnapshot.empty) {
        // Create new user document
        await setDoc(doc(db, "users", user.uid), {
          username: user.displayName || "Anonymous",
          email: user.email,
          dateCreated: serverTimestamp(),
          profilePic: profilePicBase64 || null,
        });
  
        // Notify new account creation
        setSuccessMessage("Account successfully created with Google! Redirecting to dashboard...");
      } else {
        console.log("User already exists in Firestore.");
      }
  
      // Redirect user to the dashboard
      navigate("/dashboard/home");
    } catch (error) {
      setError({ general: "Google sign-in failed. Please try again later." });
      console.error("Google sign-in error:", error);
    }
  };
  
  const handleInputChange = (field, value) => {
    setData((prevData) => ({ ...prevData, [field]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [field]: "" }));
    setError({ general: "" });
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="w-[430px] sm:w-[500px] md:w-[700px] lg:w-[800px] mt-100 text-right flex justify-end">
        <img
          src={ExitIcon}
          alt=""
          style={{ width: "39px" }}
          className="hover:scale-110 cursor-pointer"
        />
      </div>

      <div className="w-full max-w-md rounded-lg p-8 shadow-md">
        <h1 className="text-4xl font-bold text-center text-white mb-2">
          Login your Account
        </h1>
        <p className="text-lg text-center text-[#9F9BAE] mb-8">
          Please enter your details to login.
        </p>

        {error.general && (
          <div className="w-full max-w-sm mb-4 px-4 py-2 bg-red-100 text-red-600 rounded-md border border-red-300">
            {error.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mt-0 mb-0">
            <TextField
              id="filled-basic"
              label="Enter your username or email"
              variant="filled"
              type="text"
              value={data.username}
              autoComplete="off"
              onChange={(e) => handleInputChange("username", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (!data.username) {
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      username: "Username is required.",
                    }));
                    e.preventDefault();
                  } else {
                    document.getElementById("password-field").focus();
                  }
                }
              }}
              error={!!errors.username}
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
                  borderColor: errors.username ? "red" : "#9F9BAE",
                  "&:hover": {
                    borderColor: errors.username ? "red" : "#9F9BAE",
                  },
                },
              }}
            />
            {errors.username && (
              <div className="text-red-500 text-sm mt-[-9px] mb-4">
                {errors.username}
              </div>
            )}
          </div>
          <div className="">
            <TextField
              id="password-field"
              label="Enter your password"
              variant="filled"
              type={showPassword ? "text" : "password"}
              value={data.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(e);
                }
              }}
              fullWidth
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
                "&:focus-within": {
                  outline: "none",
                  boxShadow: "0 0 0 2px #4D18E8",
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
              error={!!errors.password}
            />
            {errors.password && (
              <div className="text-red-500 text-sm mt-[-1px] mb-2">
                {errors.password}
              </div>
            )}
          </div>

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-[#9F9BAE] hover:text-[#E2DDF3]"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full mt-7 bg-[#4D18E8] text-white py-3 rounded-lg hover:bg-[#6931E0] transition-colors"
          >
            Login
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-[#3B354D]"></div>
          <span className="text-sm text-[#9F9BAE] mx-3">or</span>
          <div className="flex-grow border-t border-[#3B354D]"></div>
        </div>

        <button
          className="w-full border border-[#4D18E8] bg-[#0F0A18] text-white py-3 rounded-lg flex items-center justify-center hover:bg-[#1A1426] transition-colors"
          onClick={handleGoogleSignIn}
        >
          <img src={googleIcon} alt="Google Icon" className="w-10 mr-2" />
          Sign in with Google
        </button>

        <p className="text-center text-sm text-[#9F9BAE] mt-6">
          Don’t have an account?{" "}
          <Link
            to="/sign-up"
            className="text-[#ffffff] font-bold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
