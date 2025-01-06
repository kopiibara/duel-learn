import React, { useContext } from "react"; // Import useContext correctly
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "/context/userContext"; // Adjust path if needed

const PrivateRoute = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <div>Loading...</div>; // Display a loading indicator
  }

  if (!user) {
    return <Navigate to="/login" replace />; // Redirect to login if user is not authenticated
  }

  return <Outlet />; // Render child components if user is authenticated
};

export default PrivateRoute;

