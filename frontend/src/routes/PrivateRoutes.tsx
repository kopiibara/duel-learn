import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

import DashboardLayout from "../layouts/DashboardLayout";
import Home from "../pages/dashboard/home/HomePage";
import Explore from "../pages/dashboard/explore/ExplorePage";
import YourLibrary from "../pages/dashboard/my-library/MyLibrary";
import Profile from "../pages/dashboard/profile/ProfilePage";
import Shop from "../pages/dashboard/shop/ShopPage";
import BuyPremium from "../pages/dashboard/shop/BuyPremium";
import CreateStudyMaterial from "../pages/dashboard/study-material/material-create/CreateStudyMaterial";
import ViewStudyMaterial from "../pages/dashboard/study-material/view-study-material/ViewStudyMaterial";
import SetUpQuestionType from "../pages/dashboard/play-battleground/SetUpQuestionType";

const PrivateRoutes = () => {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/landing-page" />;
  }

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="home" element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="my-library" element={<YourLibrary />} />
        <Route path="profile" element={<Profile />} />
        <Route path="shop" element={<Shop />} />
        <Route path="study-material/create" element={<CreateStudyMaterial />} />
        <Route path="study-material/view" element={<ViewStudyMaterial />} />
      </Route>
      <Route path="/shop/buy-premium-account" element={<BuyPremium />} />
      <Route path="/set-up-questions" element={<SetUpQuestionType />} />
    </Routes>
  );
};

export default PrivateRoutes;
