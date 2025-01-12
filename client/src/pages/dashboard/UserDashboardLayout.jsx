import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import SideListNavi from "../../components/SideListNavi"; 

const UserDashboardLayout = () => {
  return (
    <div className="h-screen px-1 flex flex-col lg:flex-row text-gray-100">
      {/* Sidebar (hidden on small screens) */}
      <aside className="hidden lg:block">
        <Sidebar />
      </aside>

      {/* Main Section */}
      <div className="flex-1 flex flex-col">
        <header className="w-full">
          <Header />
        </header>

        {/* Main Content Section */}
        <div className="flex flex-1 pt-2">
          <main className="flex-1  pt-3">
            <Outlet /> {/* This renders the nested routes */}
          </main>

          <SideListNavi />

        </div>
      </div>
    </div>
  );
};

export default UserDashboardLayout;
