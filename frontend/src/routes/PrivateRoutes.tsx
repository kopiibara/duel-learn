import { Routes, Route } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import Home from "../pages/dashboard/home/HomePage";
import Explore from "../pages/dashboard/explore/ExplorePage";
import YourLibrary from "../pages/dashboard/my-library/MyLibrary";
import Profile from "../pages/dashboard/profile/ProfilePage";
import Shop from "../pages/dashboard/shop/ShopPage";

const PrivateRoutes = () => {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="home" element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="my-library" element={<YourLibrary />} />
        <Route path="profile" element={<Profile />} />
        <Route path="shop" element={<Shop />} />
      </Route>
    </Routes>
  );
};

export default PrivateRoutes;
