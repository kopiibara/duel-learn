import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import AdminDashboard from "../pages/admin/admin-dashboard";
import AdminSignUp from "../pages/user-account/AdminSignUp"; // Import AdminSignUp
import AdminDashboardLayout from "../layouts/AdminDashboardLayout.tsx"; // Import AdminDashboardLayout

const AdminRoutes = () => {
  const { user } = useUser();
 /* const token = localStorage.getItem("userToken");

  if (!user || !token || user.account_type !== "admin") {
    return <Navigate to="/admin-sign-up" />;
  }*/

  return (
    <Routes>
      {/* Routes that don't use the AdminDashboardLayout */}
      <Route path="admin-sign-up" element={<AdminSignUp />} />
      
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
