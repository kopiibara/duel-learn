import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "/context/userContext"; // Assuming this context is properly set up

const PrivateRoute = () => {
  const { user } = useContext(UserContext); // Assuming 'user' is null if not logged in

  if (!user) {
    return <Navigate to="/login" replace />; // Redirect to login if not authenticated
  }

  return <Outlet />; // Allow access to child routes if authenticated
};

export default PrivateRoute;
