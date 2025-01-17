//import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/header/Header";
import RightSideBar from "../components/RightSideBar";
import { Box } from "@mui/system";

const DashboardLayout = () => {
  return (
    <Box className="h-screen flex flex-col lg:flex-row ">
      {/* Sidebar (hidden on small screens) */}
      <aside className="hidden lg:block pl-4 pr-10 top-0 h-screen ">
        <Sidebar />
      </aside>

      {/* Main Section */}
      <Box className="flex-1 flex flex-col">
        <header className="w-full pr-2 pl-0">
          <Header />
        </header>

        {/* Main Content Section */}
        <Box className="flex flex-1">
          <main className="flex-1 mr-4">
            <Outlet />
          </main>

          {/* Right Sidebar */}
          <aside className="hidden lg:block pr-2">
            <RightSideBar />
          </aside>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
