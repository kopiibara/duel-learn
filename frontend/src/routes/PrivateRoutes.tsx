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
import WelcomePage from "../pages/user-onboarding/WelcomePage";
import TutorialOnePage from "../pages/user-onboarding/TutorialOne";
import TutorialTwo from "../pages/user-onboarding/TutorialTwo";
import Personalization from "../pages/user-onboarding/Personalization";
import TutorialThree from "../pages/user-onboarding/TutorialThree";
import TutorialFour from "../pages/user-onboarding/TutorialFour";
import TutorialFive from "../pages/user-onboarding/TutorialFive";
import TutorialSix from "../pages/user-onboarding/TutorialSix";
import TutorialLast from "../pages/user-onboarding/TutorialLast";

const PrivateRoutes = () => {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/landing-page" />;
  }

  return (
    <Routes>
      {/* Onboarding and Tutorial Routes */}
      <Route path="welcome" element={<WelcomePage />} />
      <Route path="tutorial/step-one" element={<TutorialOnePage />} />
      <Route path="tutorial/step-two" element={<TutorialTwo />} />
      <Route path="tutorial/step-three" element={<TutorialThree />} />
      <Route path="tutorial/step-four" element={<TutorialFour />} />
      <Route path="tutorial/step-five" element={<TutorialFive />} />
      <Route path="tutorial/step-six" element={<TutorialSix />} />
      <Route path="tutorial/last-step" element={<TutorialLast />} />

      <Route path="my-preferences" element={<Personalization />} />

      {/* Routes for the main dashboard after onboarding */}
      <Route element={<DashboardLayout />}>
        <Route path="home" element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="my-library" element={<YourLibrary />} />
        <Route path="profile" element={<Profile />} />
        <Route path="shop" element={<Shop />} />
        <Route path="study-material/create" element={<CreateStudyMaterial />} />
        <Route path="study-material/view" element={<ViewStudyMaterial />} />
      </Route>

      {/* Route for buying premium account */}
      <Route path="/shop/buy-premium-account" element={<BuyPremium />} />
      <Route path="/set-up-questions" element={<SetUpQuestionType />} />
    </Routes>
  );
};

export default PrivateRoutes;
