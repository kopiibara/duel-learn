import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import AdminDashboard from "../pages/admin/admin-dashboard";
import AdminDashboardLayout from "../layouts/AdminDashboardLayout.tsx";

const AdminRoutes = () => {
  const { user } = useUser();
  const token = localStorage.getItem("userToken");

  // Redirect to admin sign up page if user is not logged in or not an admin
  if (!user || !token || user.account_type !== "admin") {
    return <Navigate to="/admin-sign-up" />;
  }

  // Redirect admin users with unverified emails to verify-email page
  if (user && !user.email_verified) {
    return <Navigate to="/verify-email" />;
  }

  return (
    <Routes>
      {/* Routes that use the AdminDashboardLayout */}
      <Route element={<AdminDashboardLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        {/* Add more admin routes here that should use the AdminDashboardLayout */}
      </Route>
      
      {/* Default route for admin section */}
      <Route index element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
