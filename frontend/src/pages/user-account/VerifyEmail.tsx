import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, signOutUser, sendEmail, db } from "../../services/firebase";
import { toast } from "react-hot-toast";
import sampleAvatar2 from "../../assets/images/sampleAvatar2.png";
import PageTransition from "../../styles/PageTransition";
import { getFirestore, collection, query, where, getDocs, setDoc, doc, serverTimestamp,getDoc } from "firebase/firestore";
import useEmailTimestamp from "../../hooks/useEmailTimestamp";

const VerifyEmail = () => {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const email = userData.email || "";
  const { timeRemaining, isButtonDisabled: isTimestampButtonDisabled, checkTimestamp } = useEmailTimestamp(email);

  useEffect(() => {
    if (userData) {
      setIsEmailVerified(userData.email_verified);
      console.log("Email Verified:", userData.email_verified);
      if(auth.currentUser){
        console.log("Email Verified:", auth.currentUser.emailVerified);
      }
    }
  }, [userData]);

  useEffect(() => {
    const bc = new BroadcastChannel('email-verification');

    const handleEmailVerifiedSuccess = (message: MessageEvent) => {
      if (message.data === 'email_verified_success') {
        navigate("/email-verified");
      }
    };

    bc.addEventListener('message', handleEmailVerifiedSuccess);

    return () => {
      bc.removeEventListener('message', handleEmailVerifiedSuccess);
      bc.close();
    };
  }, [navigate]);
 
  const handleSendVerificationEmail = async () => {
    try {      
      console.log("Email Verified:", userData.email_verified);
      const firebase_uid = userData.firebase_uid;
      if (auth.currentUser) {
        const actionCodeSettings = {
          url: `http://localhost:5173/email-verified?mode=verifyEmail&firebase_uid=${firebase_uid}`,
          handleCodeInApp: true,
          };
          await sendEmail(auth.currentUser!, actionCodeSettings);
        toast.success("Verification email sent.");
        setIsButtonDisabled(true);
        setIsEmailSent(true);

        const db = getFirestore();
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", auth.currentUser.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          await setDoc(doc(db, "users", userDoc.id), {
            emailTimestamp: serverTimestamp(),
          }, { merge: true });
        }

        navigate("/check-your-mail", { state: { email, firebase_uid: auth.currentUser.uid, type: "verification" } });
      } else {
        toast.error("No user is currently signed in.");
      }
    } catch (error: any) {
      console.error("Error sending verification email:", error);
      if (error.code === "auth/too-many-requests") {
        setErrorMessage("Too many requests. Please try again later.");
      } else {
        toast.error("Failed to send verification email. Please try again.");
      }
    }
  };

  const handleButtonClick = async () => {
    const canSendEmail = await checkTimestamp();
    if (canSendEmail) {
      await handleSendVerificationEmail();
    } else {
      navigate("/check-your-mail", { state: { email, firebase_uid: auth.currentUser?.uid, type: "verification" } });
    }
  };

  const handleLogoutClick = async () => {

    const userDoc = await getDoc(doc(db, "users", userData.firebase_uid));
    const isNewUser =
    !userDoc.exists() ||
    (userDoc.exists() &&
      Date.now() - userDoc.data().created_at.toMillis() < 5000);
      setTimeout(() => {
        if (userData.account_type === "admin") {
          navigate("/admin/admin-dashboard");
        } else if (isNewUser && userData.email_verified) {
          navigate("/dashboard/welcome");
        } else if (isNewUser && userData.email_verified === false) {
          navigate("/dashboard/verify-email");
        } else if (userData.email_verified === false) {
          navigate("/dashboard/verify-email");
        } else {
          navigate("/dashboard/home");
        }
      }, 2000);
  };

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      setIsButtonDisabled(true);
    } else {
      setIsButtonDisabled(false);
    }
  }, [timeRemaining]);

  return (
    <PageTransition>
      <div className="h-screen flex flex-col items-center justify-center">
        <div className="flex flex-col mb-11 items-center justify-center">
          <img
            src={sampleAvatar2}
            style={{ width: "200px" }}
            alt="Profile Avatar"
          />
        </div>

        <div className="w-full max-w-md rounded-lg p-8 shadow-md">
          <p className="text-[18px] text-center text-[#9F9BAE] mb-8 max-w-[340px] mx-auto break-words">
            {errorMessage ? errorMessage : isEmailVerified ? "🌟 A Star Twinkles — Your Email Verification is Complete! 🌟" : isEmailSent ? "Email has been sent. Please check your inbox." : "Please verify your email to continue."}
          </p>
          {!isEmailVerified && (
            <button
              type="button"
              className="w-full mt-2 bg-[#4D18E8] text-white py-3 rounded-lg hover:bg-[#6931E0] transition-colors"
              onClick={handleButtonClick}
              disabled={isButtonDisabled || isTimestampButtonDisabled}
            >
              {isButtonDisabled ? (
                <div className="relative flex justify-center items-center">
                  <div className="loader w-6 h-6 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                  <div className="absolute inset-0 w-6 h-6 rounded-full border-2 border-transparent border-t-[#D1C4E9] animate-pulse"></div>
                </div>
              ) : timeRemaining !== null && timeRemaining > 0 ? (
                `Wait ${Math.ceil(timeRemaining / 1000)} seconds`
              ) : (
                "Send Verification Email"
              )}
            </button>
          )}
          <button
            type="button"
            className="w-full mt-2 bg-[#4D18E8] text-white py-3 rounded-lg hover:bg-[#6931E0] transition-colors"
            onClick={handleLogoutClick}
          >
            Continue
          </button>
        </div>
      </div>
    </PageTransition>
  );
};

export default VerifyEmail;
