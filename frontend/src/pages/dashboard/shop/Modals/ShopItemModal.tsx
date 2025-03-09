import React, { useState } from "react";
import { Modal, Box } from "@mui/material";
import CoinIcon from "../../../../assets/CoinIcon.png";
import ConfirmPurchaseModal from "./ConfirmPurchaseModal"; // Import new modal

interface ShopItem {
  id: number;
  name: string;
  buyLabel: string;
  owned: number;
  image: string;
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
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmItem, setConfirmItem] = useState<ShopItem | null>(null); // Store selected item
  const [confirmQuantity, setConfirmQuantity] = useState(1); // Store selected quantity
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Store error message

  const handleOpenConfirmModal = () => {
    if (selectedItem) {
      if (selectedItem.owned + quantity > 5) {
        setErrorMessage("You cannot own more than 5 of this item.");
      } else {
        setConfirmItem(selectedItem); // Store selected item
        setConfirmQuantity(quantity); // Store selected quantity
        closeModal(); // Close ShopItemModal first
        setConfirmModalOpen(true); // Open ConfirmPurchaseModal
      }
    }
  };

  const handleCloseModal = () => {
    setErrorMessage(null); // Clear error message
    closeModal();
  };

  return (
    <>
      {/* First Modal: Select Quantity */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "#080511",
            boxShadow: 24,
            borderColor: "#3B354D",
            borderWidth: "1px",
            borderRadius: "16px",
            p: 4,
            textAlign: "center",
            color: "white",
          }}
        >
          {selectedItem && (
            <>
              <h2 className="text-2xl font-bold mb-2">Buy this item</h2>
              <p className="mb-4 text-sm text-[#8d80b3]">
                Select the amount of <strong>{selectedItem.name}</strong> you
                wish to buy.
              </p>

              <div className="flex justify-center items-center gap-6 mb-4">
                <div className="flex items-center my-3 gap-4">
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    className="w-[74px] h-[74px] object-contain rounded-lg mr-3"
                  />
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

              <button
                className="bg-white text-black px-5 py-2 rounded-lg font-bold w-full flex justify-center items-center hover:bg-gray-200 transition-all duration-200"
                onClick={handleOpenConfirmModal}
              >
                Buy for{" "}
                <img
                  src={CoinIcon}
                  alt="Coin"
                  className="w-5 h-5 inline-block ml-2"
                />
                <span className="text-[#9C8307] font-bold ml-2">
                  {parseInt(selectedItem.buyLabel) * quantity}
                </span>
              </button>

              {errorMessage && (
                <p className="mt-2 text-red-500">{errorMessage}</p>
              )}

              <button
                className="mt-4 text-gray-400 hover:text-gray-600 transition-all duration-200"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
            </>
          )}
        </Box>
      </Modal>

      {/* Second Modal: Confirm Purchase */}
      <ConfirmPurchaseModal
        isOpen={isConfirmModalOpen}
        closeModal={() => setConfirmModalOpen(false)}
        selectedItem={confirmItem} // Pass selected item
        quantity={confirmQuantity} // Pass selected quantity
      />
    </>
  );
};

export default ShopItemModal;
