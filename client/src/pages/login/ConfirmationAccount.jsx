import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ExitIcon from '../../assets/images/Exit.png';
import sampleAvatarDeployment from '../../assets/images/AVATARSAMPLE.png';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth ,sendResetEmail, verifyResetCode, confirmResetPassword} from "../../config";
const ConfirmationAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};
  const [username, setUsername] = useState("");  
  const [profilePic, setProfilePic] = useState("");  

  const [loading, setLoading] = useState(true); 
  const [buttonLoading, setButtonLoading] = useState(false); 
  const [error, setError] = useState("");
  

  useEffect(() => {
    if (!email) {
      setError("No email provided");
      setLoading(false);
      return;
    }
  }, [email]);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const db = getFirestore();
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
    
        const querySnapshot = await getDocs(q);
        console.log("Query Snapshot:", querySnapshot);  // Log the query result
    
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          setUsername(userDoc.data().username);
          setProfilePic(userDoc.data().profilePic);
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
  }, [email]);

  const handlePhoneInsteadClick = () => {
    //("/forgot-password");
  };
  const handleSendPasswordResetEmail = async () => {
    try {
      await sendResetEmail(auth, email, {
        url: "http://localhost:5173/Reset-Password?mode=resetPassword",
        handleCodeInApp: true,
      });
    } catch (err) {
      setError("Failed to send password reset email");
    }
  };
  

  const handleContinueClick = async () => {
    setButtonLoading(true);
    try {
      await handleSendPasswordResetEmail();
      alert("Password reset email has been sent!");
    //  navigate("/reset-password"); // Or a confirmation page
    } catch (err) {
      console.error("Error sending password reset email:", err);
    } finally {
      setButtonLoading(false);
    }
  };
  

  

  const handleExitClick = () => {
    navigate("/");
  };

  return (
    <div className="h-screen mt-[-30px] flex flex-col items-center justify-center">
      <div className="w-[430px] sm:w-[500px] md:w-[700px] lg:w-[800px] pb-6 text-right flex justify-end">
        <img
          src={ExitIcon}
          alt="Exit Icon"
          style={{ width: '39px' }}
          className="hover:scale-110 cursor-pointer"
          onClick={handleExitClick}
        />
      </div>

      <div className="flex flex-col items-center justify-center">
        <img src={profilePic || sampleAvatarDeployment} style={{ width: '100px' }} alt="Profile Avatar" />
        {loading ? (
          <h2 className="text-white uppercase text-lg text-center mt-5">Loading...</h2>
        ) : error ? (
          <h2 className="text-red-500 uppercase text-lg text-center mt-5">{error}</h2>
        ) : (
          <h2 className="text-white uppercase text-lg text-center mt-5">{username}</h2>
        )}
      </div>

      <div className="w-full max-w-md rounded-lg p-8 shadow-md">
        <h1 className="text-[42px] font-bold text-center text-white mb-2">
          Is this you?
        </h1>
        <p className="text-[18px] text-center text-[#9F9BAE] mb-8 max-w-[340px] mx-auto break-words">
          Confirm this is you and we’ll send a code to your email to recover your account.
        </p>

        <button
          type="submit"
          className={`w-full mt-2 bg-[#4D18E8] text-white py-3 rounded-lg hover:bg-[#6931E0] transition-colors flex justify-center items-center`}
          onClick={handleContinueClick}
          disabled={buttonLoading}
        >
          {buttonLoading ? (
            <div className="relative">
              <div className="loader w-6 h-6 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
              <div className="absolute inset-0 w-6 h-6 rounded-full border-2 border-transparent border-t-[#D1C4E9] animate-pulse"></div>
            </div>
          ) : (
            "Continue"
          )}
        </button>

        <button
          type="submit"
          className="w-full mt-5 border-2 border-[#4D18E8] bg-transparent text-[#4D18E8] py-3 rounded-lg hover:bg-[#4D18E8] hover:text-white transition-colors"
          onClick={handlePhoneInsteadClick}
        >
          Use phone instead
        </button>
      </div>
    </div>
  );
};

export default ConfirmationAccount;
