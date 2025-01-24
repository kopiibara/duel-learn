// src/components/ShopItemModal.tsx

import React from "react";
import { Modal, Box } from "@mui/material";
import CoinIcon from "../../../../assets/CoinIcon.png";

// Define the props type
interface ShopItem {
  id: number;
  name: string;
  buyLabel: string;
}

interface ShopItemModalProps {
  isModalOpen: boolean;
  closeModal: () => void;
  selectedItem: ShopItem | null;
  quantity: number;
  handleIncrement: () => void;
  handleDecrement: () => void;
}

const ShopItemModal: React.FC<ShopItemModalProps> = ({
  isModalOpen,
  closeModal,
  selectedItem,
  quantity,
  handleIncrement,
  handleDecrement,
}) => {
  return (
    <Modal open={isModalOpen} onClose={closeModal}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "#080511",
          boxShadow: 24,
          borderColor: "#3B354D",
          borderWidth: "1px",
          borderRadius: "10px",
          p: 4,
          textAlign: "center",
          color: "white",
        }}
      >
        {selectedItem && (
          <>
            <h2 className="text-2xl font-bold mb-2">Buy this item</h2>
            <p className="mb-4 text-sm text-[#8d80b3]">
              Select the amount of <strong>{selectedItem.name}</strong> you wish to buy.
            </p>

            <div className="flex justify-center items-center gap-6 mb-4">
              <div className="flex items-center my-3 gap-4">
                <div className="w-[74px] h-[74px] bg-white rounded-lg mr-3"></div>
                <button
                  className="bg-[#6F658D] px-4 py-2 rounded text-white text-base font-bold"
                  onClick={handleDecrement}
                >
                  -
                </button>

                <span className="text-md font-bold">{quantity}</span>

                <button
                  className="bg-[#6F658D] px-4 py-2 rounded text-white text-base font-bold"
                  onClick={handleIncrement}
                >
                  +
                </button>
              </div>
            </div>

            <button className="bg-white text-black px-5 py-2 rounded-full font-bold w-full flex justify-center items-center hover:bg-gray-200 transition-all duration-200">
              Buy for <img src={CoinIcon} alt="Coin" className="w-5 h-5 inline-block ml-2" />
              <span className="text-[#9C8307] font-bold ml-2">
                {parseInt(selectedItem.buyLabel) * quantity}
              </span>
            </button>

            <button className="mt-4 text-gray-400 hover:text-gray-600 transition-all duration-200" onClick={closeModal}>
              Cancel
            </button>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default ShopItemModal;
