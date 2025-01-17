import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import CoinIcon from "/coin-icon.svg";
import PremiumAdsBG from "../../../assets/premium-ads-bg.png";
import DocumentHead from "../../../components/DocumentHead";

const ShopPage = () => {
  const navigate = useNavigate(); // Initialize navigate function
  const [items] = useState([
    {
      id: 1,
      name: "Mana Regen Band",
      description: "Restores your mana fully.",
      useLabel: "Use",
      buyLabel: "50",
      owned: 0,
    },
    {
      id: 2,
      name: "Tech Pass",
      description: "Usable for AI Cross-Referencing and OCR features.",
      useLabel: null,
      buyLabel: "50",
      owned: 3,
    },
    {
      id: 3,
      name: "Rewards Multiplier Badge",
      description: "Doubles XP and coin rewards for 24 hours.",
      useLabel: "Use",
      buyLabel: "50",
      owned: 0,
    },
    {
      id: 4,
      name: "Fortune Coin",
      description:
        "Increases the chance for rare power card to each game for 3 turns.",
      useLabel: "Use",
      buyLabel: "50",
      owned: 0,
    },
    {
      id: 5,
      name: "Insightful Token",
      description: "Keeps your wins track event intact, even on a loss streak.",
      useLabel: "Use",
      buyLabel: "50",
      owned: 0,
    },
    {
      id: 6,
      name: "Study Starter Pack",
      description:
        "Grants a base XP boost, coins, mana refill, and insightful card.",
      useLabel: "Use",
      buyLabel: "50",
      owned: 0,
    },
  ]);

  return (
    <Box className="min-h-screen text-white px-6 pb-6 ">
      <DocumentHead title="Shop" />
      <div
        className="h-[232px] rounded-lg p-6 text-center mb-6 flex flex-col justify-center items-center"
        style={{
          backgroundImage: `url(${PremiumAdsBG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h1 className="text-3xl mb-2 font-bold">Go Premium!</h1>
        <p className="text-[16px] w-[360px]">
          Unlock advanced tools. Earn exclusive rewards. Enjoy ad-free learning!
        </p>
        <button
          className="mt-4 px-10 py-2 text-[19px] bg-white text-[#9F87E5] rounded-full font-bold"
          onClick={() => navigate("/dashboard/shop/buy-premium-account")} // Navigate on click
        >
          TRY IT NOW
        </button>
      </div>

      <hr className="border-t-1 my-9 border-[#b3b3b3]" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="border-2 border-[#6F658D] rounded-lg shadow-lg py-7 px-7 flex flex-col items-center pb-4 aspect-w-1 aspect-h-1 relative"
          >
            <div className="relative">
              {item.useLabel === null && (
                <div className="absolute top-0 left-8 w-[91px] rounded-lg bg-white text-black px-2 py-1 text-xs">
                  OWNED {item.owned} / 5
                </div>
              )}
              <div className="w-24 h-24 bg-[#6F658D] rounded mb-4"></div>
            </div>
            <h2 className="text-lg font-bold mb-2">{item.name}</h2>
            <p className="text-sm text-gray-400 mb-4 text-center">
              {item.description}
            </p>
            <div className="flex-grow"></div>
            <div className="flex gap-2 mb-3 w-full">
              {item.useLabel && (
                <button className="flex-1 border rounded-lg border-[#afafaf] text-white py-2">
                  {item.useLabel}
                </button>
              )}
              {item.buyLabel && (
                <button
                  className={`${
                    item.useLabel ? "flex-1" : "flex-grow"
                  } border rounded-lg border-[#afafaf] text-black py-2 bg-white flex items-center justify-center`}
                >
                  <span>Buy for </span>
                  <img src={CoinIcon} alt="Coin" className="w-5 h-5 ml-2" />
                  <span
                    style={{
                      color: "#9C8307",
                      marginLeft: "7px",
                      fontWeight: "bold",
                    }}
                  >
                    {item.buyLabel}
                  </span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Box>
  );
};

export default ShopPage;
