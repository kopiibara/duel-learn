// src/pages/Shop.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PremiumAdsBG from "/shop-picture/premium-ads-bg.png";
import PremiumActivatedBG from "/shop-picture/PremiumActivatedBG.png";
import CoinIcon from "/CoinIcon.png";
import ShopItemModal from "./Modals/ShopItemModal"; // Import the modal component
import { items, ShopItem } from "./data/itemsData"; // Import items from the new data file
import DocumentHead from "../../../components/DocumentHead";
import PageTransition from "../../../styles/PageTransition";

const Shop = () => {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const [isPremium, _setIsPremium] = useState(false);

  const openModal = (item: ShopItem) => {
    if (item.owned < 5) {
      setSelectedItem(item);
      setQuantity(1);
      setIsModalOpen(true);
    } else {
      alert("You cannot own more than 5 of this item.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleIncrement = () => {
    if (quantity < 5) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const getImagePaddingClass = (itemId: number) => {
    switch (itemId) {
      case 1: // Mana Regen Band
        return "pt-3";
      case 2: // Tech Pass
        return "pt-4 scale-110";
      case 3: // Rewards Multiplier Badge
        return "pt-3";
      case 4: // Fortune Coin
        return "pt-3";
      case 5: // Insightful Token
        return "pt-3";
      case 6: // Study Starter Pack
        return "pt-3 scale-150 pl-2";
      default:
        return "";
    }
  };

  return (
    <PageTransition>
      <DocumentHead title="Shop | Duel Learn" />
      <div className="h-full w-full text-white px-3 sm:px-6 pb-6">
        {/* Premium section with responsive adjustments */}
        {!isPremium && (
          <div
            className="h-auto min-h-[200px] sm:h-[232px] rounded-lg p-4 sm:p-6 text-center mb-4 sm:mb-6 flex flex-col justify-center items-center"
            style={{
              backgroundImage: `url(${PremiumAdsBG})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <h1 className="text-2xl sm:text-3xl mb-1 sm:mb-2 font-bold">
              Go Premium!
            </h1>
            <p className="text-[14px] sm:text-[16px] w-full sm:w-[360px] px-2 sm:px-0">
              Unlock advanced tools. Earn exclusive rewards. Enjoy ad-free
              learning!
            </p>
            <button
              className="mt-3 sm:mt-4 px-6 sm:px-10 py-2 text-[16px] sm:text-[19px] bg-white text-[#9F87E5] rounded-full font-bold"
              onClick={() => navigate("/dashboard/buy-premium-account")}
            >
              TRY IT NOW
            </button>
          </div>
        )}

        {/* Premium activated section with responsive adjustments */}
        {isPremium && (
          <div
            className="h-auto min-h-[200px] sm:h-[232px] rounded-lg p-4 sm:p-6 text-center mb-4 sm:mb-6 flex flex-col justify-center items-center"
            style={{
              backgroundImage: `url(${PremiumActivatedBG})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <h1 className="text-2xl sm:text-3xl mb-1 sm:mb-2 font-bold">
              Premium Perks Unlocked!
            </h1>
            <p className="text-[13px] sm:text-[15px] my-1 sm:my-2 w-full sm:w-[390px] px-2 sm:px-0">
              You're all set to access the best tools and rewards. Stay ahead
              with ad-free, uninterrupted learning.
            </p>
            <button
              className="mt-3 sm:mt-4 px-6 sm:px-10 py-2 text-[14px] sm:text-[15px] bg-white text-[#3e2880] rounded-full font-bold"
              onClick={() => navigate("/dashboard/shop/buy-premium-account")}
            >
              ENDS IN 24D 1H
            </button>
          </div>
        )}

        <hr className="border-t-2 border-[#3B354D] mb-6" />

        {/* Responsive grid for shop items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="border-[0.2rem] border-[#3B354C] rounded-[1rem] shadow-lg py-4 sm:py-7 px-4 sm:px-7 flex flex-col items-center pb-4 aspect-w-1 aspect-h-1 relative"
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className={`w-20 h-20 sm:w-24 sm:h-24 object-contain mb-3 sm:mb-4 rounded ${getImagePaddingClass(
                    item.id
                  )}`}
                />
              </div>
              <h2 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">
                {item.name}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 text-center">
                {item.description}
              </p>
              <div className="flex-grow"></div>
              <div className="flex gap-2 mb-2 sm:mb-3 w-full">
                {item.owned > 0 && (
                  <button className="flex-1 border rounded-lg border-[#afafaf] text-white py-1.5 sm:py-2 text-sm sm:text-base hover:bg-[#544483]">
                    Use
                  </button>
                )}

                {item.owned < 5 && item.buyLabel && (
                  <button
                    className="flex-1 border rounded-lg border-[#afafaf] text-black py-1.5 sm:py-2 bg-white flex items-center justify-center hover:bg-[#e0e0e0] text-sm sm:text-base"
                    onClick={() => openModal(item)}
                  >
                    <span>Buy for </span>
                    <img
                      src={CoinIcon}
                      alt="Coin"
                      className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2"
                    />
                    <span
                      style={{
                        color: "#9C8307",
                        marginLeft: "5px",
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

        {/* Pass props to the modal */}
        <ShopItemModal
          isModalOpen={isModalOpen}
          closeModal={closeModal}
          selectedItem={selectedItem}
          quantity={quantity}
          handleIncrement={handleIncrement}
          handleDecrement={handleDecrement}
        />
      </div>
    </PageTransition>
  );
};

export default Shop;
