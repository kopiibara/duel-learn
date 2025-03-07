import React, { createContext, useState, useContext, useEffect } from "react";
import { auth, } from "../services/firebase"; // Adjust your path if needed
import { User as FirebaseUser } from "firebase/auth"; // Import Firebase User type

interface User {
  firebase_uid: string;
  username: string | null;
  email: string | null;
  display_picture: string | null;
  full_name: string | null;
  email_verified: boolean;
  isSSO: boolean;
  account_type: "free" | "premium" | "admin";
  isNew: boolean;
  level: number;
  exp: number;
  mana: number;
  coins: number;
}

interface UserContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  });

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        console.log("User authenticated:", firebaseUser);

        const updatedUser: User = {
          firebase_uid: firebaseUser.uid,
          username: firebaseUser.displayName || null,
          email: firebaseUser.email || null,
          display_picture: firebaseUser.photoURL || null,
          full_name: null,
          email_verified: firebaseUser.emailVerified,
          isSSO: firebaseUser.providerData.some((p) => p?.providerId !== "password"),
          account_type: "free", // You can fetch this from your DB
          isNew: firebaseUser.metadata.creationTime === firebaseUser.metadata.lastSignInTime,
          level: 1,           // Fetch from your backend if needed
          exp: 0,
          mana: 100,
          coins: 0,
        };

        setUser(updatedUser);
        localStorage.setItem("userData", JSON.stringify(updatedUser));
      } else {
        console.log("No user is signed in");
        setUser(null);
        localStorage.removeItem("userData");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextProps => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
