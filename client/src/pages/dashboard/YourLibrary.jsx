import React from "react";

import { auth } from "../../config";
import { onAuthStateChanged } from "firebase/auth";

const YourLibrary = () => {
  return (
    <div className="home">
      <h1 className="text-[#E2DDF3] text-2xl">YourLibrary</h1>
    </div>
  );
};

export default YourLibrary;
