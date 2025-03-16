import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import useUserData from "../hooks/api.hooks/useUserData";
import { useAuth } from "./AuthContext";

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

export interface Friend {
  firebase_uid: string;
  exp: number;
  username: string;
  display_picture: string;
  level: number;
}

interface UserContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  loadUserData: (firebase_uid: string) => Promise<User | null>;
  updateUser: (updates: Partial<User>) => void;
  clearUserData: () => void;
  loginAndSetUserData: (firebase_uid: string, token: string) => Promise<User | null>;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  });

  const [loading, setLoading] = useState(true);
  const { fetchAndUpdateUserData } = useUserData();
  const auth = useAuth(); // Use the AuthContext

  // Clear user data (used when logging out)
  const clearUserData = useCallback(() => {
    setUser(null);
    localStorage.removeItem("userData");
    sessionStorage.removeItem("userData");
  }, []);

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

  // Load user data from database
  const loadUserData = async (firebase_uid: string): Promise<User | null> => {
    try {
      setLoading(true);
      console.log(`Attempting to load user data for: ${firebase_uid}`);
      
      // Skip loading for new users that haven't verified email yet
      if (auth.currentUser && !auth.currentUser.emailVerified && 
          auth.currentUser.metadata.creationTime === auth.currentUser.metadata.lastSignInTime) {
        console.log("New unverified user - skipping database fetch");
        return null;
      }
      
      // Try to fetch verified user data first
      try {
        console.log("Fetching user data from main database...");
        const userData = await fetchAndUpdateUserData(firebase_uid);
        if (userData) {
          console.log("User found in main database:", userData.username);
          // Update state with user data
          const updatedUser = updateUserState(userData);
          return updatedUser;
        }
      } catch (dbError: any) {
        console.log(`Error fetching from main database: ${dbError.message}`);
        
        // Don't keep looking in temp_users if the error is something other than "not found"
        if (dbError.message && !dbError.message.includes("not found")) {
          throw dbError;
        }
        
        console.log("Checking temp_users collection...");
      }

      // Check temp_users for unverified users
      const tempUserDoc = await getDoc(doc(db, "temp_users", firebase_uid));
      if (!tempUserDoc.exists()) {
        console.error("User not found in temp_users collection either");
        throw new Error("User not found in any database. You may need to complete registration.");
      }

      // Handle unverified user from temp_users
      const tempUserData = tempUserDoc.data();
      const userDataWithDefaults = {
        ...tempUserData,
        firebase_uid,
        email_verified: false,
        isNew: true,
        display_picture: null,
        full_name: null,
        level: 1,
        exp: 0,
        mana: 200,
        coins: 500,
        isSSO: false,
        account_type: tempUserData.account_type || "free",
        username: tempUserData.username || null,
        email: tempUserData.email || null,
      };

      const updatedUser = updateUserState(userDataWithDefaults);
      return updatedUser;
    } catch (error) {
      console.error("Error loading user data:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Effect to load user data on auth state change
  useEffect(() => {
    const loadData = async () => {
      if (auth.currentUser && auth.isAuthenticated) {
        setLoading(true);
        try {
          // Check if this is a newly created user in the signup process
          const isNewUserSignup = 
            auth.currentUser.metadata.creationTime === auth.currentUser.metadata.lastSignInTime && 
            !auth.currentUser.emailVerified;
            
          // Skip loading user data during initial signup - will be loaded after email verification
          if (isNewUserSignup) {
            console.log("New user in signup process - skipping initial user data fetch");
            setLoading(false);
            return;
          }
          
          await loadUserData(auth.currentUser.uid);
        } catch (error) {
          console.error("Error loading initial user data:", error);
        } finally {
          setLoading(false);
        }
      } else if (!auth.isLoading && !auth.currentUser) {
        // Clear user data if not authenticated
        clearUserData();
        setLoading(false);
      }
    };

    loadData();
  }, [auth.currentUser, auth.isAuthenticated, auth.isLoading]);

  // Effect to clear user data on logout
  useEffect(() => {
    if (!auth.isAuthenticated && !auth.isLoading) {
      clearUserData();
    }
  }, [auth.isAuthenticated, auth.isLoading, clearUserData]);

  // Function to manually refresh user data - will be called after relevant actions
  const refreshUserData = useCallback(async () => {
    if (user && auth.currentUser && auth.currentUser.emailVerified) {
      try {
        console.log("Manually refreshing user data");
        const userData = await fetchAndUpdateUserData(user.firebase_uid);
        updateUserState(userData);
      } catch (error) {
        console.error("Error refreshing user data:", error);
      }
    }
  }, [user, auth.currentUser, updateUserState, fetchAndUpdateUserData]);

  // Login and set user data in one operation - used after email verification
  const loginAndSetUserData = async (firebase_uid: string, token: string): Promise<User | null> => {
    try {
      console.log(`Loading user data after verification for: ${firebase_uid}`);
      setLoading(true);
      
      // Set the token in auth context if possible
      if (auth.token !== token) {
        console.log("Updating token in auth context");
        // This is a way to set the token directly if needed
        // The setAuthToken function from apiClient would be called automatically
        // through the AuthTokenSynchronizer
      }
      
      // Load the user data using the regular function
      const userData = await loadUserData(firebase_uid);
      console.log("User data loaded after verification:", userData);
      
      return userData;
    } catch (error) {
      console.error("Error loading user data after verification:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loading,
        loadUserData,
        updateUser: updateUserState,
        clearUserData,
        loginAndSetUserData,
        refreshUserData
      }}
    >
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
