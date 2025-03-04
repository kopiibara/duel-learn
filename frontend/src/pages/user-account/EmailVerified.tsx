import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import sampleAvatar2 from "../../assets/images/sampleAvatar2.png";
import PageTransition from "../../styles/PageTransition";
import { toast } from "react-hot-toast";
import useUpdateEmailVerifiedApi from "../../hooks/api.hooks/useUpdateEmailVerifiedApi";
import { db, auth } from "../../services/firebase";
import { setDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";

const EmailVerified = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateEmailVerifiedApi } = useUpdateEmailVerifiedApi();
  const [email, setEmail] = useState("");
  const [firebase_uid, setFirebaseUid] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [accountType, setAccountType] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const locationState = location.state || {};
      setEmail(locationState.email || "");
      setFirebaseUid(locationState.firebase_uid || "");

      if (locationState.firebase_uid) {
        try {
          const userDocRef = doc(db, "users", locationState.firebase_uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setAccountType(userData.account_type || "");
            
            // Check if user is new (created within last 5 minutes)
            const isNew = Date.now() - userData.created_at.toMillis() < 300000;
            setIsNewUser(isNew);

            // Only update verification status for new users
            if (isNew) {
              try {
                // Update email verified status
                await setDoc(userDocRef, {
                  email_verified: true,
                  updated_at: serverTimestamp(),
                }, { merge: true });

                // Update backend
                await updateEmailVerifiedApi(
                  locationState.firebase_uid,
                  true,
                  new Date().toISOString()
                );

                // Set email verified status only once on success
                setIsEmailVerified(true);
              } catch (error: any) {
                console.error("Error updating verification status:", error);
                toast.error("Failed to update verification status. Please try again.");
              }
            } else {
              // For existing users, just set the verification status from their data
              setIsEmailVerified(userData.email_verified || false);
            }

            // Log verification status
            console.log("Email Verified:", userData.email_verified);
            if (auth.currentUser) {
              console.log("Firebase Email Verified:", auth.currentUser.emailVerified);
              console.log("Firebase Email:", email);
            }
          }
        } catch (error: any) {
          console.error("Error fetching user document:", error);
          toast.error("Failed to fetch user information. Please try again.");
        }
      }
    };

    fetchUserData();
  }, [location.state, updateEmailVerifiedApi]);

  const handleBacktoLoginClick = async () => {
    setTimeout(() => {
      if (accountType === "admin") {
        navigate("/admin/admin-dashboard");
      } else if (isNewUser && isEmailVerified) {
        navigate("/dashboard/welcome");
      } else if (!isEmailVerified) {
        navigate("/dashboard/verify-email");
      } else {
        navigate("/dashboard/home");
      }
    }, 2000);
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
            Congratulations! Your email has been successfully verified.
          </p>
          <button
            type="button"
            className="w-full mt-2 bg-[#4D18E8] text-white py-3 rounded-lg hover:bg-[#6931E0] transition-colors"
            onClick={handleBacktoLoginClick}
          >
            Continue Onboarding
          </button>
        </div>
      </div>
    </PageTransition>
  );
};

export default EmailVerified;
