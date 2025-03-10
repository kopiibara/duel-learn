import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { auth } from "../services/firebase";
import { User as FirebaseUser } from "firebase/auth";
import useUserData from "../hooks/api.hooks/useUserData";

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
<<<<<<< HEAD
=======
  level: number;
  exp: number;
  mana: number;
  coins: number;
>>>>>>> cfa57d4327f05816e98fd7fdf169bc5cd8f299fd
}

interface UserContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
<<<<<<< HEAD
  loading: boolean;
  updateUser: (updates: Partial<User>) => void; // Add this function
=======
  logout: () => Promise<void>;
  loginAndSetUserData: (firebase_uid: string, token: string) => Promise<User>;
}

interface FirebaseError {
  code: string;
  message: string;
>>>>>>> cfa57d4327f05816e98fd7fdf169bc5cd8f299fd
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

const REFRESH_INTERVAL = 60000; // 1 minute

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  });

<<<<<<< HEAD
  const [loading, setLoading] = useState(true);

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

=======
  const { fetchAndUpdateUserData } = useUserData();

  // 🟢 Update user state and localStorage/sessionStorage
  const updateUserState = useCallback((userData: any) => {
    const updatedUser: User = {
      firebase_uid: userData.firebase_uid,
      username: userData.username,
      email: userData.email,
      display_picture: userData.display_picture,
      full_name: userData.full_name || null,
      email_verified: userData.email_verified,
      isSSO: userData.isSSO,
      account_type: userData.account_type || "free",
      isNew: userData.isNew || false,
      level: userData.level || 1,
      exp: userData.exp || 0,
      mana: userData.mana || 200,
      coins: userData.coins || 500,
    };

    // Avoid unnecessary updates
    setUser((prevUser) => {
      if (JSON.stringify(prevUser) !== JSON.stringify(updatedUser)) {
        localStorage.setItem("userData", JSON.stringify(updatedUser));
        sessionStorage.setItem("userData", JSON.stringify(updatedUser));
        return updatedUser;
      }
      return prevUser;
    });

    return updatedUser;
  }, []);

  // 🔑 Handle login and fetch user data
  const loginAndSetUserData = useCallback(async (firebase_uid: string, token: string) => {
    try {
      const userData = await fetchAndUpdateUserData(firebase_uid, token);
      return updateUserState(userData);
    } catch (error) {
      console.error("Error during login and data setup:", error);
      throw error;
    }
  }, [fetchAndUpdateUserData, updateUserState]);

  // 🚪 Clear user data on logout
  const clearUserData = useCallback(() => {
    setUser(null);
    localStorage.removeItem("userData");
    sessionStorage.removeItem("userData");
  }, []);

  // 🟠 Logout function
  const logout = useCallback(async () => {
    try {
      await auth.signOut();
      clearUserData();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }, [clearUserData]);

  // 🔄 Refresh user data (on interval or when needed)
  const refreshUserData = useCallback(async () => {
    if (user && auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken(true); // Force token refresh
        const userData = await fetchAndUpdateUserData(user.firebase_uid, token);
        updateUserState(userData);
      } catch (error: unknown) {
        console.error("Error refreshing user data:", error);
        if (error && typeof error === "object" && "code" in error) {
          const firebaseError = error as FirebaseError;
          if (firebaseError.code === "auth/user-token-expired" || firebaseError.code === "auth/user-not-found") {
            clearUserData();
          }
        }
      }
    }
  }, [user, fetchAndUpdateUserData, clearUserData, updateUserState]);
/*
  // ✅ Auth state listener (handles login, logout, and token refresh)
>>>>>>> cfa57d4327f05816e98fd7fdf169bc5cd8f299fd
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        try {
          const token = await firebaseUser.getIdToken();
          const userData = await fetchAndUpdateUserData(firebaseUser.uid, token);
          updateUserState(userData);
        } catch (error: unknown) {
          console.error("Error during auth state change:", error);
          clearUserData();
        }
      } else {
        clearUserData();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [clearUserData, fetchAndUpdateUserData, updateUserState]);
*/
  // ⏱️ Set up periodic data refresh
  useEffect(() => {
    if (user) {
      const intervalId = setInterval(refreshUserData, REFRESH_INTERVAL);
      return () => clearInterval(intervalId);
    }
  }, [user, refreshUserData]);

  return (
<<<<<<< HEAD
    <UserContext.Provider value={{ user, setUser, loading, updateUser }}>
=======
    <UserContext.Provider value={{ user, setUser, logout, loginAndSetUserData }}>
>>>>>>> cfa57d4327f05816e98fd7fdf169bc5cd8f299fd
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
