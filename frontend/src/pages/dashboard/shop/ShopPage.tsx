// src/pages/Shop.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PremiumAdsBG from "../../../assets/shop-picture/premium-ads-bg.png";
import PremiumActivatedBG from "../../../assets/shop-picture/PremiumActivatedBG.png";
import CoinIcon from "../../../assets/CoinIcon.png";
import Footer from "../../../components/Footer";
import ShopItemModal from "./Modals/ShopItemModal";  // Import the modal component
import { items, ShopItem } from "./data/itemsData"; // Import items from the new data file

const Shop = () => {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const [isPremium, setIsPremium] = useState(false);

  const openModal = (item: ShopItem) => {
    setSelectedItem(item);
    setQuantity(1);
    setIsModalOpen(true);
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

  return (
    <div className="min-h-screen text-white px-6 pb-6">
      {/* Your premium section and items display logic */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="border-2 border-[#6F658D] rounded-lg shadow-lg py-7 px-7 flex flex-col items-center pb-4 aspect-w-1 aspect-h-1 relative"
          >
            <div className="relative">
              {item.owned > 0 && (
                <div className="absolute top-0 left-8 w-[91px] rounded-lg bg-white text-black px-2 py-1 text-xs">
                  OWNED {item.owned} / 5
                </div>
              )}
              <div className="w-24 h-24 bg-[#6F658D] rounded mb-4"></div>
            </div>
            <h2 className="text-lg font-bold mb-2">{item.name}</h2>
            <p className="text-sm text-gray-400 mb-4 text-center">{item.description}</p>
            <div className="flex-grow"></div>
            <div className="flex gap-2 mb-3 w-full">
              {item.owned > 0 && (
                <button className="flex-1 border rounded-lg border-[#afafaf] text-white py-2 hover:bg-[#544483] ">
                  Use
                </button>
              )}

              {item.owned < 5 && item.buyLabel && (
                <button
                  className="flex-1 border rounded-lg border-[#afafaf] text-black py-2 bg-white flex items-center justify-center hover:bg-[#e0e0e0]"
                  onClick={() => openModal(item)}
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

      {/* Pass props to the modal */}
      <ShopItemModal
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        selectedItem={selectedItem}
        quantity={quantity}
        handleIncrement={handleIncrement}
        handleDecrement={handleDecrement}
      />

      <Footer />
    </div>
  );
};

export default Shop;
