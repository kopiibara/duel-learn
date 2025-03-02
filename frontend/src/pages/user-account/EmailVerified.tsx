import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect } from "react";
import sampleAvatar2 from "../../assets/images/sampleAvatar2.png";
import PageTransition from "../../styles/PageTransition";
import { toast } from "react-hot-toast";
import useUpdateEmailVerifiedApi from "../../hooks/api.hooks/useUpdateEmailVerifiedApi";
import { db } from "../../services/firebase";
import { setDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";

const EmailVerified = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateEmailVerifiedApi } = useUpdateEmailVerifiedApi();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const firebase_uid = queryParams.get("firebase_uid") || "";

    const updateEmailVerifiedStatus = async () => {
      console.log("firebase_uid:", firebase_uid);
      try {
        const userDocRef = doc(db, "users", firebase_uid);

        // Update Firebase users collection
        await setDoc(userDocRef, {
          email_verified: true,
          updated_at: serverTimestamp(),
        }, { merge: true });
        console.log('Updating Firebase users collection');

        // Update users table in the backend
        await updateEmailVerifiedApi(
          firebase_uid,
          true,
          new Date().toISOString()
        );
        console.log('Updating TABLE users in the backend');

        console.log('Email verified status updated');
        const bc = new BroadcastChannel('email-verification');
        bc.postMessage('email_verified_success');
      } catch (error: any) {
        console.error("Error updating email verified status:", error);
        toast.error("Failed to update email verified status. Please try again.");
      }
    };

    updateEmailVerifiedStatus();
  }, [location.search, updateEmailVerifiedApi]);

  const handleBacktoLoginClick = async () => {
    const userDoc = await getDoc(doc(db, "users", firebase_uid));
    const isNewUser =
      !userDoc.exists() ||
      (userDoc.exists() &&
        Date.now() - userDoc.data().created_at.toMillis() < 300000); // 5 minutes in milliseconds

    setTimeout(() => {
      if (userData.account_type === "admin") {
        navigate("/admin/admin-dashboard");
      } else if (isNewUser && userData.email_verified) {
        navigate("/dashboard/welcome");
      } else if (isNewUser && !userData.email_verified) {
        navigate("/dashboard/verify-email");
      } else if (!userData.email_verified) {
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
