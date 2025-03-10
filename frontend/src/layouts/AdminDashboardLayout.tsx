import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/header/Header";
import Footer from "../components/Footer";
import { Box } from "@mui/system";
import "../styles/custom-scrollbar.css";
import WidgetsIcon from "@mui/icons-material/Widgets";
import { useMediaQuery, Typography } from "@mui/material"; // Import useMediaQuery from Material-UI

const AdminDashboardLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:1022px)"); // Check if the screen size is mobile
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);

  const toggleDrawer = (open: boolean) => {
    setDrawerOpen(open);
  };

  return (
    <Box
      className={`h-screen px-8 flex flex-col lg:flex-row w-screen overflow-x-hidden ${
        useMediaQuery("(min-width:1400px)") ? "px-11" : "px-25"
      }`}
    >
      {/* Sidebar (hidden on small screens) */}
      <aside className="hidden lg:block pl-4 pr-4 h-screen sticky top-0">
        <Box>
          
          <Sidebar
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
          />
        </Box>
      </aside>

      {/* Main Section */}
      <Box className="flex-1 flex flex-col">
        <header className="w-full pr-2 top-0 pb-2 sticky z-50 bg-[#080511] shadow-sm">
          <Header />
        </header>

        {/* Main Content Section */}
        <Box className="flex flex-1">
          <main
            className={`flex-1 pt-3 relative ${
              useMediaQuery("(min-width:1400px)") ? "px-11" : "px-25"
            }`}
          >
            <Outlet />
            <Footer />

            {/* Absolute icon button in the top-right corner (only shown on mobile screens) */}
            {isMobile && (
              <button
                className="absolute top-2 right-4 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-500 disabled:bg-purple-400 disabled:cursor-not-allowed"
                onClick={() => toggleDrawer(true)}
              >
                <WidgetsIcon />
              </button>
            )}
          </main>
        </Box>
      </Box>

      {/* Admin-specific drawer for mobile */}
      {isMobile && drawerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => toggleDrawer(false)}
        >
          <div 
            className="absolute right-0 top-0 h-full w-64 bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6" component="div" className="font-bold text-purple-600">
                Admin Menu
              </Typography>
              <button 
                onClick={() => toggleDrawer(false)}
                className="p-2 rounded-full hover:bg-gray-200"
              >
                ✕
              </button>
            </div>
            <Sidebar
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
            />
          </div>
        </div>
      )}
    </Box>
  );
};

export default AdminDashboardLayout; 