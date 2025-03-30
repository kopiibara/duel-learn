import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useAuth } from "../contexts/AuthContext";
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
import { useState, useEffect } from "react";
import LoadingScreen from "../pages/dashboard/play-battleground/screens/LoadingScreen";
import GeneralLoadingScreen from "../components/LoadingScreen"
import SessionReport from "../pages/dashboard/play-battleground/screens/SessionReport";
import PeacefulMode from "../pages/dashboard/play-battleground/modes/peaceful/PeacefulMode";
import TimePressuredMode from "../pages/dashboard/play-battleground/modes/time-pressured/TimePressuredMode";
import GameModeWrapper from "../pages/dashboard/play-battleground/components/common/GameModeWrapper";
import AccountSettings from "../pages/dashboard/settings/AccountSettings";
import HostModeSelection from "../pages/dashboard/play-battleground/modes/multiplayer/setup/HostModeSelection";
import Player2ModeSelection from "../pages/dashboard/play-battleground/modes/multiplayer/setup/Player2ModeSelection";
import PvpBattle from "../pages/dashboard/play-battleground/modes/multiplayer/battle-field/PvpBattle";
import SearchPage from "../pages/dashboard/search/SearchPage";
import SocketService from "../services/socketService";

const PrivateRoutes = () => {
  const { user, loading: userLoading, refreshUserData, socketConnected } = useUser();
  const { isAuthenticated, isLoading: authLoading, currentUser } = useAuth();
  const [_selectedIndex, setSelectedIndex] = useState<number | null>(1);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Reference to socket service
  const socketService = SocketService.getInstance();

  // Add loading timeout to prevent infinite loading
  useEffect(() => {
    // If still loading after 5 seconds, allow the user to proceed anyway
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Monitor and maintain socket connection throughout protected routes
  useEffect(() => {
    // Only attempt to connect if we have a valid user and authentication
    if (user && currentUser && !socketConnected) {
      console.log("PrivateRoutes: Socket connection not detected, reconnecting...");
      
      // Connect using the user's firebase_uid
      socketService.connect(user.firebase_uid);
      
      // Log connection status after a short delay
      setTimeout(() => {
        const socket = socketService.getSocket();
        console.log(`Socket connection status check: ${socket?.connected ? 'Connected' : 'Disconnected'}`);
      }, 1000);
    }
    
    // Set up periodic connection check 
    const connectionMonitor = setInterval(() => {
      if (user && currentUser) {
        const socket = socketService.getSocket();
        
        // If socket exists but is disconnected, attempt reconnection
        if (socket && !socket.connected) {
          console.log("Socket disconnected, attempting to reconnect...");
          socketService.connect(user.firebase_uid);
        } 
        // If no socket at all, create new connection
        else if (!socket) {
          console.log("No socket instance found, creating new connection");
          socketService.connect(user.firebase_uid);
        }
      }
    }, 30000); // Check every 30 seconds
    
    return () => {
      clearInterval(connectionMonitor);
    };
  }, [user, currentUser, socketConnected]);

  // Show loading screen if both auth and user data are still loading and timeout hasn't occurred
  if ((authLoading || userLoading) && !loadingTimeout) {
    return <GeneralLoadingScreen />;
  }

  // If not authenticated, redirect to landing page
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/landing-page" />;
  }

  // If authenticated but no user data loaded yet, try to load it
  if (!user && !loadingTimeout) {
    // Attempt to refresh user data if not loaded
    if (!userLoading) {
      refreshUserData();
    }
    return <GeneralLoadingScreen />;
  }

  // Only check email verification if we actually have user data
  if (user && !user.email_verified) {
    return <Navigate to="/verify-email" />;
  }

  return (
    <>
      {/* Optional: Socket connection status indicator (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            zIndex: 9999,
            width: '15px',
            height: '15px',
            borderRadius: '50%',
            background: socketConnected ? '#4CAF50' : '#F44336',
            boxShadow: '0 0 5px rgba(0,0,0,0.5)'
          }}
          title={socketConnected ? "Socket Connected" : "Socket Disconnected"}
        />
      )}
    
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
          <Route path="search" element={<SearchPage />} />
          <Route path="account-settings" element={<AccountSettings />} />
        </Route>

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
        <Route path="/pvp-battle/:lobbyCode?" element={<PvpBattle />} />
      </Routes>
    </>
  );
};

export default PrivateRoutes;
