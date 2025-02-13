import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../services/firebase";
import { sendEmailVerification } from "firebase/auth";
import { toast } from "react-hot-toast";
import sampleAvatar2 from "../../assets/images/sampleAvatar2.png";
import PageTransition from "../../styles/PageTransition";
import { getFirestore, collection, query, where, getDocs, setDoc, doc, serverTimestamp } from "firebase/firestore";

const VerifyEmail = () => {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setIsEmailVerified(user.emailVerified);
      console.log("Email Verified:", user.emailVerified);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      setIsButtonDisabled(false);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    const fetchEmailTimestamp = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const db = getFirestore();
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", user.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

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
          }
        }
      } catch (err) {
        console.error("Error fetching email timestamp:", err);
      }
    };

    fetchEmailTimestamp();
  }, []);

  const handleSendVerificationEmail = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        toast.success("Verification email sent.");
        setIsButtonDisabled(true);
        setIsEmailSent(true);

        const db = getFirestore();
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          await setDoc(doc(db, "users", userDoc.id), {
            emailTimestamp: serverTimestamp(),
          }, { merge: true });
        }

        setTimeRemaining(5 * 60 * 1000); // 5 minutes
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

  const handleBacktoLoginClick = () => {
    navigate("/dashboard/home");
  };

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
            {errorMessage ? errorMessage : isEmailVerified ? "Email is Already Verified" : isEmailSent ? "Email has been sent. Please check your inbox." : "Please verify your email to continue."}
          </p>
          {!isEmailVerified && (
            <button
              type="button"
              className="w-full mt-2 bg-[#4D18E8] text-white py-3 rounded-lg hover:bg-[#6931E0] transition-colors"
              onClick={handleSendVerificationEmail}
              disabled={isButtonDisabled || (timeRemaining !== null && timeRemaining > 0)}
            >
              {isButtonDisabled ? (
                <div className="relative">
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
            onClick={handleBacktoLoginClick}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </PageTransition>
  );
};

export default VerifyEmail;
