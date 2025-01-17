// Welcome.jsx
import React, { useEffect } from "react";
import { UserProvider } from "/context/userContext";

const Welcome = () => {
  const { user } = UserContext();

  useEffect(() => {
    if (user) {
      console.log(`Welcome, ${user.username}!`);
    }
  }, [user]);

  return <div>{user ? `Welcome, ${user.username}!` : "Loading..."}</div>;
};

export default Welcome;
