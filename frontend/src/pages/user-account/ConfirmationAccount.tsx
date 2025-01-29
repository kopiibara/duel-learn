import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import axios from "axios"; // Import axios for making HTTP requests
import ExitIcon from "../../assets/images/Exit.png";
import sampleAvatarDeployment from "../../assets/images/sampleAvatarDeployment.jpg";

const ConfirmationAccount = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get location object
  const { email } = location.state || {}; // Retrieve email from state
  const [username, setUsername] = useState(""); // State to hold the username
  const [loading, setLoading] = useState(true); // Loading state
  const [buttonLoading, setButtonLoading] = useState(false); // Button loading state
  const [error, setError] = useState(""); // Error state

  useEffect(() => {
    const fetchUsername = async () => {
      if (!email) {
        setError("No email provided");
        setLoading(false);
        return;
      }

      console.log("Email being sent to API:", email);

      try {
        const response = await axios.get("/confirmation-account", {
          params: { email },
        });

        if (response.data.username) {
          setUsername(response.data.username); // Set username to state
        } else {
          setError("Username not found for the email");
        }
      } catch (error) {
        setError("Error fetching username");
        console.error("Error fetching username:", error);
      } finally {
        setLoading(false); // Stop loading once the request is complete
      }
    };

    fetchUsername();
  }, [email]);

  const handlePhoneInsteadClick = () => {
    navigate("/forgot-password"); // Navigate to forgot password if user chooses phone
  };

  const handleContinueClick = async () => {
    setButtonLoading(true); // Set button loading state
    try {
      const response = await axios.post("/confirmation-account", { email });

      if (response.status === 200) {
        console.log("Email sent successfully:", response.data.message);
        navigate("/security-code", { state: { email } }); // Navigate to the security code page
      } else {
        setError("Failed to send email. Please try again.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setError("An error occurred while sending the email.");
    } finally {
      setButtonLoading(false); // Stop button loading once the request is complete
    }
  };

  const handleExitClick = () => {
    navigate("/"); // Navigate to home when the exit icon is clicked
  };

  return (
    <div className="h-screen mt-[-30px] flex flex-col items-center justify-center">
      <div className="w-[430px] sm:w-[500px] md:w-[700px] lg:w-[800px] pb-6 text-right flex justify-end">
        <img
          src={ExitIcon}
          alt="Exit Icon"
          style={{ width: "39px" }}
          className="hover:scale-110 cursor-pointer"
          onClick={handleExitClick}
        />
      </div>

      <div className="flex flex-col items-center justify-center">
        <img
          src={sampleAvatarDeployment}
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
        <h1 className="text-[42px] font-bold text-center text-white mb-2">
          Is this you?
        </h1>
        <p className="text-[18px] text-center text-[#9F9BAE] mb-8 max-w-[340px] mx-auto break-words">
          Confirm this is you and we’ll send a code to your email to recover
          your account.
        </p>

        <button
          type="submit"
          className={`w-full mt-2 bg-[#4D18E8] text-white py-3 rounded-lg hover:bg-[#6931E0] transition-colors flex justify-center items-center`}
          onClick={handleContinueClick}
          disabled={buttonLoading} // Disable button while loading
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
