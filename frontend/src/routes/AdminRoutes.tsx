import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useEffect, useState } from "react";
import LoadingScreen from "../components/LoadingScreen";
import AdminDashboardLayout from "../layouts/AdminDashboardLayout";

// Import all admin components from the barrel file
import {
  UserManagement,
  ContentManagement, 
  CreateContent,
  AdminSettings,
  AdminNotifications,
  AdminSupport,
  AdminActions,
  AdminDashboard,
  GameSettings
} from "../pages/admin";

const AdminRoutes = () => {
  const { user } = useUser();
  const token = localStorage.getItem("userToken");
  const [isLoading, setIsLoading] = useState(true);
  
  // Check localStorage for persisted admin status
  const userData = localStorage.getItem("userData");
  const parsedUserData = userData ? JSON.parse(userData) : null;
  const isAdmin = parsedUserData?.account_type === "admin";

  // Effect to handle initial loading
  useEffect(() => {
    // If we have user data or explicitly know we don't have a user, stop loading
    if (user || user === null) {
      setIsLoading(false);
    }
    
    // Log for debugging
    if (user) {
      console.log("AdminRoutes - User data loaded:", user);
      console.log("AdminRoutes - Is admin:", user.account_type === "admin");
    }
  }, [user]);

  // While loading, show loading screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Use both the React state user and localStorage as fallback
  // This ensures we don't redirect incorrectly during state transitions
  if ((!user && !isAdmin) || (user && user.account_type !== "admin" && !isAdmin)) {
    console.log("AdminRoutes - Redirecting to admin-sign-up: No admin user found");
    return <Navigate to="/admin-sign-up" />;
  }

  // If we have a user (from state or localStorage) but email isn't verified
  if ((user && !user.email_verified) || (parsedUserData && !parsedUserData.email_verified)) {
    console.log("AdminRoutes - Redirecting to verify-email: Email not verified");
    return <Navigate to="/verify-email" />;
  }

  console.log("AdminRoutes - Rendering admin routes");
  
  return (
    <Routes>
      {/* Routes that use the AdminDashboardLayout */}
      <Route element={<AdminDashboardLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        
        {/* User Management */}
        <Route path="users" element={<UserManagement />} />
        
        {/* Content Management */}
        <Route path="content" element={<ContentManagement />} />
        <Route path="content/create" element={<CreateContent />} />
        
        {/* Settings */}
        <Route path="settings" element={<AdminSettings />} />
        
        {/* Notifications */}
        <Route path="notifications" element={<AdminNotifications />} />
        
        {/* Support */}
        <Route path="support" element={<AdminSupport />} />
        
        {/* Admin Actions */}
        <Route path="actions" element={<AdminActions />} />
        
        {/* Game Settings */}
        <Route path="game-settings" element={<GameSettings />} />
      </Route>
      
      {/* Default route for admin section */}
      <Route index element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
