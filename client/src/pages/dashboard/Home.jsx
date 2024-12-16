import React, { useEffect, useState } from "react";
import "../../index.css";
import { auth } from "../../config";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const Home = () => {
  const [username, setUsername] = useState(""); // Default state
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const fetchedUsername = await fetchUsername(user.uid);
        setUsername(fetchedUsername);
      } else {
        navigate("/");
      }
    });
  
    return () => unsubscribe();
  }, [navigate]);
  const fetchUsername = async (uid) => {
    const db = getFirestore();
    const userDoc = doc(db, "users", uid);
    const userSnapshot = await getDoc(userDoc);
  
    if (userSnapshot.exists()) {
      return userSnapshot.data().username;
    } else {
      console.log("No such document!");
      return "User";
    }
  };
  
  
  return (
    <div className="flex">
      <h1 className="text-[#E2DDF3] text-2xl">
        {username ? `Home. Welcome, ${username}` : "Loading..."}
      </h1>
    </div>
  );
};

export default Home;

