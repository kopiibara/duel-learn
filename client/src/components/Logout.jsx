import * as React from "react";
import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { auth, signOutUser } from "../config"; // Adjust the path as necessary

export default function Logout() {
  const navigate = useNavigate();

  // Logout function
  const handleLogout = () => {
    // Call the signOut function from config.js
    signOutUser(auth);

    // Clear user data from context (or localStorage/sessionStorage/cookies if necessary)
    // Example: localStorage.removeItem("userToken");

    // Redirect to login page and block back navigation
    navigate("/login", { replace: true });
  };

  return (
    <Paper sx={{ width: 320, maxWidth: "100%" }}>
      <MenuList>
        <MenuItem onClick={handleLogout}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Logout
          </Typography>
        </MenuItem>
      </MenuList>
    </Paper>
  );
}
