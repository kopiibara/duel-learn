import { Routes, Route } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import Home from "../pages/dashboard/home/HomePage";
import Explore from "../pages/dashboard/explore/ExplorePage";
import YourLibrary from "../pages/dashboard/my-library/MyLibrary";
import Profile from "../pages/dashboard/profile/ProfilePage";
import Shop from "../pages/dashboard/shop/ShopPage";
import BuyPremium from "../pages/dashboard/shop/BuyPremium";
import CreateStudyMaterial from "../pages/dashboard/study-material/material-create/CreateStudyMaterial";

const PrivateRoutes = () => {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="home" element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="my-library" element={<YourLibrary />} />
        <Route path="profile" element={<Profile />} />
        <Route path="shop" element={<Shop />} />
        <Route path="study-material/create" element={<CreateStudyMaterial />} />
      </Route>

      <Route path="/shop/buy-premium-account" element={<BuyPremium />} />
    </Routes>
  );
};

export default PrivateRoutes;
