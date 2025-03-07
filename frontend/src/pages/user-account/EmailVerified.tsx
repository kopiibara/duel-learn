import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import sampleAvatar2 from "../../assets/images/sampleAvatar2.png";
import PageTransition from "../../styles/PageTransition";
import { toast } from "react-hot-toast";
import useUpdateEmailVerifiedApi from "../../hooks/api.hooks/useUpdateEmailVerifiedApi";
import { db, auth } from "../../services/firebase";
import { setDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";
import { reload, applyActionCode } from "firebase/auth";
import { useUser } from "../../contexts/UserContext";
const EmailVerified = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateEmailVerifiedApi } = useUpdateEmailVerifiedApi();
  const [email, setEmail] = useState("");
  const [firebase_uid, setFirebaseUid] = useState("");
  const [_isNewUser, setIsNewUser] = useState(false);
  const [accountType, setAccountType] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const { setUser } = useUser(); // Get user from context
  useEffect(() => {
    const fetchUserData = async () => {
      const locationState = location.state || {};
      setEmail(locationState.email || "");
      setFirebaseUid(locationState.firebase_uid || "");

      if (locationState.firebase_uid) {
        try {
          setFirebaseUid(locationState.firebase_uid || "");
          const userDocRef = doc(db, "users", locationState.firebase_uid);
          const userDoc = await getDoc(userDocRef);
          console.log("User Document:", userDoc.data());
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setAccountType(userData.account_type || "");

            // Check if user is new (created within last 5 minutes)
            const isNew = Date.now() - userData.created_at.toMillis() < 300000;
            setIsNewUser(isNew);

            // Update email verified status
            if (!isEmailVerified) {
              // Apply the email verification action code
              if (locationState.oobCode) {
                await applyActionCode(auth, locationState.oobCode);
                setIsEmailVerified(true);
              }

              await setDoc(
                userDocRef,
                {
                  email_verified: true,
                  updated_at: serverTimestamp(),
                },
                { merge: true }
              );

              // Update backend
              await updateEmailVerifiedApi(
                locationState.firebase_uid,
                true,
                new Date().toISOString()
              );

              // Remove email timestamp from localStorage
              localStorage.removeItem("emailTimestamp");

              // Reload the user to get the latest email verification state
              if (auth.currentUser) {
                await reload(auth.currentUser);
                const userDocRef = doc(db, "users", locationState.firebase_uid);
                const userDoc = await getDoc(userDocRef);
                const userData = userDoc.data();
                setIsEmailVerified(userData?.email_verified || false);
                console.log("Email Verified:", userData?.email_verified);
              }
            }
            // Log verification status
            console.log("Email Verified:", userData.email_verified);
            if (auth.currentUser) {
              console.log(
                "Firebase Email Verified:",
                auth.currentUser.emailVerified
              );
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
    const userDoc = await getDoc(doc(db, "users", firebase_uid));

    if (userDoc.exists()) {
      const userData = {
        firebase_uid: firebase_uid,
        username: userDoc.data().username,
        email: userDoc.data().email,
        display_picture: userDoc.data().display_picture,
        isNew: userDoc.data().isNewUser,
        full_name: userDoc.data().full_name,
        email_verified: userDoc.data().email_verified,
        isSSO: userDoc.data().isSSO,
        level: userDoc.data().level || 0, // Add required level property
        account_type: userDoc.data().account_type as
          | "free"
          | "premium"
          | "admin", // Ensure the value is either 'free' or 'premium'
      };
      console.log("User Data:", userData);
      const isNewUser =
        !userDoc.exists() ||
        (userDoc.exists() &&
          Date.now() - userDoc.data().created_at.toMillis() < 300000);

      // Store user data in context
      setUser(userData);

      setTimeout(() => {
        if (accountType === "admin") {
          navigate("/admin/admin-dashboard");
        } else if (isNewUser) {
          navigate("/dashboard/welcome");
        } else {
          navigate("/dashboard/home");
        }
      }, 2000);
    }
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
