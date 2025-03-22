import { useState, useEffect } from "react";
import PremiumBuyBG from "/shop-picture/PremiumBuyBG.png";
import PremiumStar from "/shop-picture/PremiumStar.png";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./BuyPremimun.css";

const BuyPremium = () => {
  const [isLoaded, setIsLoaded] = useState(false); // Track whether the background image is loaded
  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    // Preload the background image
    const img = new Image();
    img.src = PremiumBuyBG;

    img.onload = () => {
      // Ensure loading spinner is shown for at least 2 seconds
      setTimeout(() => setIsLoaded(true), 1000);
    };

    // In case the image fails to load, fallback to display the page
    img.onerror = () => {
      console.error("Failed to load background image.");
      setTimeout(() => setIsLoaded(true), 2000);
    };
  }, []);

  return (
    <div>
      {/* Show loading screen until the background image is loaded */}
      {!isLoaded && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            width: "100%",
            backgroundColor: "#080511", // Dark background color for loading
          }}
        >
          {/* Loading Spinner */}
          <div
            style={{
              border: "8px solid rgba(255, 255, 255, 0.2)", // Light gray border
              borderTop: "8px solid #FFFFFF", // White border for spinning effect
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              animation: "spin 1s linear infinite", // Spinner animation
            }}
          ></div>
        </div>
      )}

      {/* Main content (hidden until the background image is loaded) */}
      {isLoaded && (
        <div
          className="buy-premium-container"
          style={{
            backgroundImage: `url(${PremiumBuyBG})`,
            backgroundSize: "cover",
            backgroundPosition: "bottom center",
            height: "100vh", // Full viewport height
            width: "100%", // Full width
            color: "#FFFFFF",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Close Button */}
          <button
            onClick={() => navigate("/dashboard/shop")}
            style={{
              position: "absolute",
              top: "66px",
              right: "86px",
              background: "transparent",
              border: "none",
              color: "#FFFFFF",
              fontSize: "35px",
              cursor: "pointer",
            }}
            aria-label="Close"
          >
            &times;
          </button>

          {/* Modal Content */}
          <div
            style={{
              borderRadius: "16px",
              padding: "32px",
              width: "90%",
              maxWidth: "500px",
              marginTop: "-120px",
              textAlign: "center",
              color: "#FFFFFF",
            }}
          >
            {/* Premium Star Icon */}
            <img
              src={PremiumStar}
              alt="Premium Star"
              style={{
                width: "23px",
                height: "23px",
                display: "block",
                margin: "0 auto 26px", // Center icon and add margin below
              }}
            />

            {/* Header */}
            <h1
              style={{
                fontSize: "30px",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              DUEL-LEARN PREMIUM
            </h1>
            <p
              style={{
                fontSize: "16px",
                marginBottom: "24px",
                color: "#9F9BAE",
              }}
            >
              Choose the plan that fits your needs and unlock exclusive features
              to enhance your learning experience.
            </p>

            {/* Divider */}
            <hr
              style={{
                border: "1px solid #FFFFFF",
                opacity: 0.2,
                margin: "16px 0",
              }}
            />

            {/* Feature Table */}
            <table
              style={{
                width: "100%",
                marginBottom: "32px",
                color: "#FFFFFF",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: "left", paddingBottom: "8px" }}>
                    Feature
                  </th>
                  <th style={{ textAlign: "center", paddingBottom: "8px" }}>
                    Free
                  </th>
                  <th style={{ textAlign: "center", paddingBottom: "8px" }}>
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "8px 0", textAlign: "left" }}>
                    Optical Character Recognition
                  </td>
                  <td style={{ padding: "8px 0", textAlign: "center" }}>
                    Limited
                  </td>
                  <td style={{ padding: "8px 0", textAlign: "center" }}>
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 0", textAlign: "left" }}>
                    AI Cross-Referencing
                  </td>
                  <td style={{ padding: "8px 0", textAlign: "center" }}>
                    Unavailable
                  </td>
                  <td style={{ padding: "8px 0", textAlign: "center" }}>
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 0", textAlign: "left" }}>
                    Personal Study Modes
                  </td>
                  <td style={{ padding: "8px 0", textAlign: "center" }}>
                    Limited
                  </td>
                  <td style={{ padding: "8px 0", textAlign: "center" }}>
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 0", textAlign: "left" }}>
                    PvP Battles
                  </td>
                  <td style={{ padding: "8px 0", textAlign: "center" }}>
                    Limited
                  </td>
                  <td style={{ padding: "8px 0", textAlign: "center" }}>
                    Unlimited
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Go Premium Button */}
            <button
              style={{
                backgroundColor: "#fff",
                border: "none",
                color: "#000",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              GO PREMIUM
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyPremium;
