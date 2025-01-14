import React from "react";
import ProfileHeader from "../../components/Profile/ProfileHeader"
import Statictics from "../../components/Profile/Statictics"
import Achievements from "../../components/Profile/Achievements"
import Footer from "../../components/Footer"
import Leaderboards from "../../components/Profile/Leaderboards"

const Profile = () => {
  return (
    <div className="min-h-screen text-white px-7">
      {/* Profile Header */}
      <ProfileHeader />

      {/* Statistics Section */}
      <Statictics />

      {/* Achievements Section */}
      <Achievements />

      {/* Leaderboards Section */}
      <Leaderboards />

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default Profile;
