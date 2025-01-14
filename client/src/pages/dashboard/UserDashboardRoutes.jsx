import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UserDashboardLayout from "./UserDashboardLayout";
import Home from "./Home";
import Explore from "./Explore";
import YourLibrary from "./YourLibrary";
import Profile from "./Profile";
import Shop from "./Shop";
import NotFound from "../login/NotFoundPage";
import BuyPremium from "../../components/Shop/BuyPremium";

const UserDashboardRoutes = () => {
    return (
        <Routes>
            {/* Routes with UserDashboardLayout */}
            <Route path="/" element={<UserDashboardLayout />}>
                <Route index element={<Navigate to="home" replace />} />
                <Route path="home" element={<Home />} />
                <Route path="explore" element={<Explore />} />
                <Route path="your-library" element={<YourLibrary />} />
                <Route path="profile" element={<Profile />} />
                <Route path="shop" element={<Shop />} />
                <Route path="*" element={<NotFound />} />
            </Route>

            {/* Standalone Route for BuyPremium */}
            <Route path="/shop/buy-premium-account" element={<BuyPremium />} />
        </Routes>
    );
};

export default UserDashboardRoutes;
