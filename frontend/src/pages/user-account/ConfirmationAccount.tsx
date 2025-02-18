import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ExitIcon from "../../assets/images/Exit.png";
import sampleAvatarDeployment from "../../assets/images/sampleAvatar2.png";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, sendResetEmail } from "../../services/firebase";
import PageTransition from "../../styles/PageTransition";

const ConfirmationAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPhone, setIsPhone] = useState(false); // State to track if input is phone
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!email) {
      setError("No email or phone provided");
      setLoading(false);
      return;
    }

    // Check if the input is an email or phone number
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\d{10,15}$/;

    if (emailPattern.test(email)) {
      setIsPhone(false);
    } else if (phonePattern.test(email)) {
      setIsPhone(true);
    } else {
      setError("Invalid email or phone format");
      setLoading(false);
      return;
    }
  }, [email]);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const db = getFirestore();
        const usersRef = collection(db, "users");
        let q;

        if (isPhone) {
          q = query(usersRef, where("phone", "==", email));
        } else {
          q = query(usersRef, where("email", "==", email));
        }

        const querySnapshot = await getDocs(q);
        console.log("Query Snapshot:", querySnapshot); // Log the query result

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          setUsername(userData.username);
          setProfilePic(userData.profilePic);

          if (userData.emailTimestamp) {
            const emailTimestamp = userData.emailTimestamp.toDate();
            const now = new Date();
            const elapsed = now.getTime() - emailTimestamp.getTime();
            const remaining = 5 * 60 * 1000 - elapsed;

            if (remaining > 0) {
              setTimeRemaining(remaining);
              const interval = setInterval(() => {
                setTimeRemaining((prev) => {
                  if (prev && prev > 1000) {
                    return prev - 1000;
                  } else {
                    clearInterval(interval);
                    return null;
                  }
                });
              }, 1000);
            }
          }
        } else {
          setError("User not found");
        }
      } catch (err) {
        setError("Failed to fetch user data");
        console.error("Error fetching user data:", err); // Log the error for more details
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchUsername();
    }
  }, [email, isPhone]);

  const handleSendPasswordResetEmail = async (firebase_uid: string) => {
    try {
      await sendResetEmail(auth, email, {
        url: `http://localhost:5173/Reset-Password?mode=resetPassword&firebase_uid=${firebase_uid}`,
        handleCodeInApp: true,
      });
    } catch (err) {
      setError("Failed to send password reset email");
    }
  };

  const handleContinueClick = async () => {
    setButtonLoading(true);
    try {
      const db = getFirestore();
      const usersRef = collection(db, "users");
      const q = query(usersRef, where(isPhone ? "phone" : "email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const firebase_uid = userDoc.id;

        await handleSendPasswordResetEmail(firebase_uid);
        alert("Password reset email has been sent! Check your inbox.");

        await setDoc(doc(db, "users", userDoc.id), {
          emailTimestamp: serverTimestamp(),
        }, { merge: true });

        setLoading(true); // Show loading screen during timeout
        setTimeout(() => {
          navigate("/login"); // Or a confirmation page
        }, 2000); // 2-second delay before navigating
      } else {
        setError("User not found");
      }
    } catch (err) {
      console.error("Error sending password reset email:", err);
    } finally {
      setButtonLoading(false);
      setLoading(false); // Hide loading screen after timeout
    }
  };

  const handleExitClick = () => {
    navigate("/");
  };

  return (
    <PageTransition>
      <div className="h-screen mt-[-30px] flex flex-col items-center justify-center">
        <header className="absolute top-20 left-20 right-20 flex justify-between items-center">
          {/* Logo & Title */}
          <Link to="/" className="flex items-center space-x-4">
            <img src="/duel-learn-logo.svg" className="w-10 h-10" alt="icon" />
            <p className="text-white text-xl font-semibold">Duel Learn</p>
          </Link>

          {/* Exit Button */}
          <img
            src={ExitIcon}
            alt="Exit Icon"
            style={{ width: "39px" }}
            className="hover:scale-110 cursor-pointer"
            onClick={handleExitClick}
          />
        </header>

        <div className="flex flex-col items-center justify-center">
          <img
            src={profilePic || sampleAvatarDeployment}
            style={{ width: "100px" }}
            alt="Profile Avatar"
          />
          {loading ? (
            <h2 className="text-white uppercase text-lg text-center mt-5">
              Loading...
            </h2>
          ) : error ? (
            <h2 className="text-red-500 uppercase text-lg text-center mt-5">
              {error}
            </h2>
          ) : (
            <h2 className="text-white uppercase text-lg text-center mt-5">
              {username}
            </h2>
          )}
        </div>

        <div className="w-full max-w-md rounded-lg p-8 shadow-md">
          <h1 className="text-3xl font-bold text-center text-white mb-2">
            Is this you?
          </h1>
          <p className="text-lg text-center text-[#9F9BAE] mb-8 max-w-[340px] mx-auto break-words">
            Confirm this is you and we’ll send a code to your{" "}
            {isPhone ? "phone" : "email"} to recover your account.
          </p>

          <button
            type="submit"
            className={`w-full mt-2 bg-[#4D18E8] text-white py-3 rounded-lg hover:bg-[#6931E0] transition-colors flex justify-center items-center`}
            onClick={handleContinueClick}
            disabled={buttonLoading || (timeRemaining !== null && timeRemaining > 0)}
          >
            {buttonLoading ? (
              <div className="relative">
                <div className="loader w-6 h-6 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                <div className="absolute inset-0 w-6 h-6 rounded-full border-2 border-transparent border-t-[#D1C4E9] animate-pulse"></div>
              </div>
            ) : timeRemaining !== null && timeRemaining > 0 ? (
              `Wait ${Math.ceil(timeRemaining / 1000)} seconds`
            ) : (
              "Continue"
            )}
          </button>
        </div>
      </div>
    </PageTransition>
  );
};

export default ConfirmationAccount;
