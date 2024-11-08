import React from 'react';
import { useUserContext } from '../../../context/userContext' // Import your UserContext

const Welcome = () => {
    const { user } = useUserContext();  // Access the user data from context

    // If user is not loaded yet, show a loading message or a fallback
    if (!user) {
        return <p>Loading...</p>;  // Show loading if user data is not available
    }

    return (
        <p>Welcome, {user.username}!</p>  // Display the username of the logged-in user
    );
};

export default Welcome;
