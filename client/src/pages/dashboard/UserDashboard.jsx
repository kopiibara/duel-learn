import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./Home";
import Explore from "./Explore";
import YourLibrary from "./YourLibrary";
import Profile from "./Profile";
import Shop from "./Shop";
import NotFound from "../login/NotFoundPage"; // Not Found component

function UserDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
    <Headers/>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`bg-[#2d2d2d] w-64 p-4 text-white ${isCollapsed ? "w-20" : "w-64"} transition-all`}
        >
          <ul>
            <li className="mb-4">
              <Link to="/dashboard/home" className="hover:text-[#E2DDF3]">
                Home
              </Link>
            </li>
            <li className="mb-4">
              <Link to="/dashboard/explore" className="hover:text-[#E2DDF3]">
                Explore
              </Link>
            </li>
            <li className="mb-4">
              <Link to="/dashboard/your-library" className="hover:text-[#E2DDF3]">
                Your Library
              </Link>
            </li>
            <li className="mb-4">
              <Link to="/dashboard/profile" className="hover:text-[#E2DDF3]">
                Profile
              </Link>
            </li>
            <li className="mb-4">
              <Link to="/dashboard/shop" className="hover:text-[#E2DDF3]">
                Shop
              </Link>
            </li>
          </ul>

          {/* Collapse/Expand Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute bottom-4 left-4 text-white p-2 rounded-md hover:bg-[#130a2e] transition-all"
          >
            {isCollapsed ? "Expand" : "Collapse"}
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 bg-[#f9f9f9]">
          <Routes>
            {/* Default Route */}
            <Route path="home" element={<Home />} />
            <Route path="explore" element={<Explore />} />
            <Route path="your-library" element={<YourLibrary />} />
            <Route path="profile" element={<Profile />} />
            <Route path="shop" element={<Shop />} />
            {/* Catch-All Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default UserDashboard;
