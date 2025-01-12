import React from "react";
import PremiumAdsBG from "../../assets/images/PremiumAdsBG.png"

const Shop = () => {
  const items = [
    {
      id: 1,
      name: "Mana Regen Band",
      description: "Restores your mana fully.",
      useLabel: "Use",
      buyLabel: "Buy for 50",
    },
    {
      id: 2,
      name: "Tech Pass",
      description: "Usable for AI Cross-Referencing and OCR features.",
      useLabel: null,
      buyLabel: "Buy for 50",
    },
    {
      id: 3,
      name: "Rewards Multiplier Badge",
      description: "Doubles XP and coin rewards for 24 hours.",
      useLabel: "Use",
      buyLabel: "Buy for 50",
    },
    {
      id: 4,
      name: "Fortune Coin",
      description:
        "Increases the chance for rare power card to each game for 3 turns.",
      useLabel: "Use",
      buyLabel: "Buy for 50",
    },
    {
      id: 5,
      name: "Insightful Token",
      description:
        "Keeps your wins track event intact, even on a loss streak.",
      useLabel: "Use",
      buyLabel: "Buy for 50",
    },
    {
      id: 6,
      name: "Study Starter Pack",
      description:
        "Grants a base XP boost, coins, mana refill, and insightful card.",
      useLabel: "Use",
      buyLabel: "Buy for 50",
    },
  ];

  return (
    <div className="min-h-screen text-white p-6">
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
        <button className="mt-4 px-10 py-2 text-[19px] bg-white text-[#9F87E5] rounded-full font-bold">
          TRY IT NOW
        </button>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="border-2 border-[#6F658D] rounded-lg shadow-lg pt-9 px-6 flex flex-col items-center pb-4"
          >
            <div className="w-16 h-16 bg-[#9F87E5] rounded mb-4"></div>
            <h2 className="text-lg font-bold mb-2">{item.name}</h2>
            <p className="text-sm text-gray-400 mb-4 text-center">
              {item.description}
            </p>

            {/* Spacer to push buttons to the bottom */}
            <div className="flex-grow"></div>

            {/* Buttons at the bottom */}
            <div className="flex gap-2 w-full">
              {item.useLabel && (
                <button className="flex-1 border border-[#afafaf] rounded text-white py-2">
                  {item.useLabel}
                </button>
              )}
              {item.buyLabel && (
                <button
                  className={`${item.useLabel ? "flex-1" : "flex-grow"
                    } border border-[#afafaf] rounded text-black py-2 bg-white`}
                >
                  {item.buyLabel}
                </button>
              )}
            </div>
          </div>

        ))}
      </div>

      <footer className="mt-6 text-center text-gray-500">
        <p>Privacy</p>
        <p>Terms</p>
        <p>© 2024 Duel-Learn Inc.</p>
      </footer>
    </div>
  );
};

export default Shop;
