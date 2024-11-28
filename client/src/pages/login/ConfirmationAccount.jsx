import { useNavigate } from "react-router-dom";
import ExitIcon from '../../assets/images/Exit.png';
import React, { useState } from "react";
import { TextField } from "@mui/material";
import axios from 'axios'; // Ensure axios is imported
import ProfileAvatar from '../../assets/images/profileAvatar.png'

const ConfirmationAccount = () => {
  const navigate = useNavigate();

  const handlePhoneInsteadClick = () => {
    navigate("/forgot-password"); // Navigate to home when the exit icon is clicked
  };

  const handleContinueClick = () => {
    navigate("/security-code"); // Navigate to home when the exit icon is clicked
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
          style={{ width: '39px' }}
          className="hover:scale-110 cursor-pointer"
          onClick={handleExitClick}
        />
      </div>

      <div className="flex flex-col items-center justify-center">
        <img src={ProfileAvatar} alt="" />
        <h2 className="text-white uppercase text-lg text-center mt-5">Gwyneth Uy</h2>
      </div>


      <div className="w-full max-w-md rounded-lg p-8 shadow-md">
        {/* Heading */}
        <h1 className="text-[42px] font-bold text-center text-white mb-2">
          Is this you?
        </h1>
        <p className="text-[18px] text-center text-[#9F9BAE] mb-8 max-w-[340px] mx-auto break-words">
          Confirm this is you and we’ll send a code to your email to recover your account.        </p>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-2 bg-[#4D18E8] text-white py-3 rounded-lg hover:bg-[#6931E0] transition-colors"
          onClick={handleContinueClick}
       >
          Continue
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
