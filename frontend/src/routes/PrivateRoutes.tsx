import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import DashboardLayout from "../layouts/DashboardLayout";
import Home from "../pages/dashboard/home/HomePage";
import Explore from "../pages/dashboard/explore/ExplorePage";
import YourLibrary from "../pages/dashboard/my-library/MyLibrary";
import Profile from "../pages/dashboard/profile/ProfilePage";
import Shop from "../pages/dashboard/shop/ShopPage";
import BuyPremium from "../components/BuyPremium";
import CreateStudyMaterial from "../pages/dashboard/study-material/material-create/CreateStudyMaterial";
import ViewStudyMaterial from "../pages/dashboard/study-material/view-study-material/ViewStudyMaterial";
import SetUpQuestionType from "../pages/dashboard/play-battleground/components/setup/SetUpQuestionType";
import WelcomePage from "../pages/user-onboarding/WelcomePage";
import TutorialOnePage from "../pages/user-onboarding/TutorialOne";
import TutorialTwo from "../pages/user-onboarding/TutorialTwo";
import Personalization from "../pages/user-onboarding/Personalization";
import TutorialThree from "../pages/user-onboarding/TutorialThree";
import TutorialFour from "../pages/user-onboarding/TutorialFour";
import TutorialFive from "../pages/user-onboarding/TutorialFive";
import TutorialSix from "../pages/user-onboarding/TutorialSix";
import TutorialLast from "../pages/user-onboarding/TutorialLast";
import WelcomeGameMode from "../pages/dashboard/play-battleground/screens/WelcomeGameMode";
import SetUpTimeQuestion from "../pages/dashboard/play-battleground/components/setup/SetUpTimeQuestion";
import PVPLobby from "../pages/dashboard/play-battleground/modes/multiplayer/PVPLobby";
import { useState } from "react";
import VerifyEmail from "../pages/user-account/VerifyEmail";
import CheckYourMail from "../pages/user-account/CheckYourMail";
import LoadingScreen from "../pages/dashboard/play-battleground/screens/LoadingScreen";
import SessionReport from "../pages/dashboard/play-battleground/screens/SessionReport";
import PeacefulMode from "../pages/dashboard/play-battleground/modes/peaceful/PeacefulMode";
import TimePressuredMode from "../pages/dashboard/play-battleground/modes/time-pressured/TimePressuredMode";
import GameModeWrapper from "../pages/dashboard/play-battleground/components/common/GameModeWrapper";
import AccountSettings from "../pages/dashboard/settings/AccountSettings";
import HostModeSelection from "../pages/dashboard/play-battleground/modes/multiplayer/setup/HostModeSelection";
import Player2ModeSelection from "../pages/dashboard/play-battleground/modes/multiplayer/setup/Player2ModeSelection";
import PvpBattle from "../pages/dashboard/play-battleground/modes/multiplayer/battle-field/PvpBattle";

const PrivateRoutes = () => {
  const { user } = useUser();
  const [_selectedIndex, setSelectedIndex] = useState<number | null>(1);

  if (!user ) {
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
        <Route
          path="home"
          element={<Home setSelectedIndex={setSelectedIndex} />}
        />
        <Route path="explore" element={<Explore />} />
        <Route path="my-library" element={<YourLibrary />} />
        <Route path="profile" element={<Profile />} />
        <Route path="shop" element={<Shop />} />
        <Route path="study-material/create" element={<CreateStudyMaterial />} />
        <Route
          path="study-material/view/:studyMaterialId"
          element={<ViewStudyMaterial />}
        />
        <Route path="account-settings" element={<AccountSettings />} />
      </Route>

      {/* Authentication Routes */}
      <Route path="verify-email" element={<VerifyEmail />} />
      <Route path="/check-your-mail" element={<CheckYourMail />} />

      {/* Premium Routes */}
      <Route path="/buy-premium-account" element={<BuyPremium />} />

      {/* Game Setup Routes */}
      <Route path="/welcome-game-mode" element={<WelcomeGameMode />} />
      <Route path="/setup/questions" element={<SetUpQuestionType />} />
      <Route path="/setup/timer" element={<SetUpTimeQuestion />} />
      <Route path="/loading-screen" element={<LoadingScreen />} />

      {/* Game Mode Routes */}
      <Route
        path="/study/peaceful-mode"
        element={
          <GameModeWrapper>
            {(props) => <PeacefulMode {...props} />}
          </GameModeWrapper>
        }
      />
      <Route
        path="/study/time-pressured-mode"
        element={
          <GameModeWrapper>
            {(props) => <TimePressuredMode {...props} />}
          </GameModeWrapper>
        }
      />
      <Route path="/pvp-lobby/:lobbyCode?" element={<PVPLobby />} />
      <Route path="/study/session-summary" element={<SessionReport />} />
      <Route path="/select-difficulty/pvp" element={<HostModeSelection />} />
      <Route
        path="/select-difficulty/pvp/player2"
        element={<Player2ModeSelection />}
      />
      <Route path="/pvp-battle" element={<PvpBattle />} />
    </Routes>
  );
};

export default PrivateRoutes;
