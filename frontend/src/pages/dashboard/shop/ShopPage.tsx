import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PremiumAdsBG from "../../../assets/shop-picture/premium-ads-bg.png";
import PremiumActivatedBG from "../../../assets/shop-picture/PremiumActivatedBG.png";
import CoinIcon from "../../../assets/CoinIcon.png";
import Footer from "../../../components/Footer";

const Shop = () => {
  const navigate = useNavigate();

  // Set initial state for premium account
  const [isPremium, setIsPremium] = useState(false); // Change this value to true to simulate premium status

  const items = [
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
      description: "Increases the chance for rare power card to each game for 3 turns.",
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
      description: "Grants a base XP boost, coins, mana refill, and insightful card.",
      useLabel: "Use",
      buyLabel: "50",
      owned: 0,
    },
  ];

  return (
    <div className="min-h-screen text-white px-6 pb-6">
      {/* Show this section only if the user is not premium */}
      {!isPremium && (
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
            Unlock advanced tools. Earn exclusive rewards.
            Enjoy ad-free learning!
          </p>
          <button
            className="mt-4 px-10 py-2 text-[19px] bg-white text-[#9F87E5] rounded-full font-bold"
            onClick={() => navigate("/dashboard/shop/buy-premium-account")}
          >
            TRY IT NOW
          </button>
        </div>
      )}

      {/* Show this section only if the user is premium */}
      {isPremium && (
        <div
          className="h-[232px] rounded-lg p-6 text-center mb-6 flex flex-col justify-center items-center"
          style={{
            backgroundImage: `url(${PremiumActivatedBG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <h1 className="text-3xl mb-2 font-bold">Premium Perks Unlocked!</h1>
          <p className="text-[15px] my-21 w-[390px]">
            You're all set to access the best tools and rewards.
            Stay ahead with ad-free, uninterrupted learning.
          </p>
          <button
            className="mt-4 px-10 py-2 text-[15px] bg-white text-[#3e2880] rounded-full font-bold"
            onClick={() => navigate("/dashboard/shop/buy-premium-account")}
          >
            ENDS IN 24D 1H
          </button>
        </div>
      )}

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
                  className={`${item.useLabel ? "flex-1" : "flex-grow"
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

      <Footer />
    </div>
  );
};

export default Shop;
