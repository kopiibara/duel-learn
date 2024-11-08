import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();

// This function fetches user profile data from the server if a user is not already set.
const fetchUserProfile = async (setUser) => {
    try {
        const { data } = await axios.get('/welcome', { withCredentials: true });
        setUser(data);
    } catch (error) {
        console.error("Failed to fetch user profile:", error);
    }
};

const UserContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (!user) {
            fetchUserProfile(setUser);
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

const useUserContext = () => {
    return useContext(UserContext);
};

export { UserContext, UserContextProvider, useUserContext };
