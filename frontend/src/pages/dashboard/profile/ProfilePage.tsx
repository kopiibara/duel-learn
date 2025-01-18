import React from "react";
import ProfileHeader from "./ProfileHeader"
import Statictics from "./Statistics"
import Achievements from "./Achievements"
import Footer from "../../../components/Footer"
import Leaderboards from "./Leaderboards"

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
      <div className="mb-11">
      <Footer />
      </div>

    </div>
  );
};

export default Profile;
