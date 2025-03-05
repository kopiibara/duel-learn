import React from "react";
import { Modal, Box } from "@mui/material";

interface ConfirmPurchaseModalProps {
  isOpen: boolean;
  closeModal: () => void;
  selectedItem: { name: string; buyLabel: string } | null;
  quantity: number;
}

const ConfirmPurchaseModal: React.FC<ConfirmPurchaseModalProps> = ({
  isOpen,
  closeModal,
  selectedItem,
  quantity,
}) => {
  return (
    <Modal open={isOpen} onClose={closeModal}>
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
            <h2 className="text-2xl font-bold mb-2">Confirm Purchase</h2>
            <p className="mb-4 text-sm text-[#8d80b3]">
              Are you sure you want to buy [{quantity}x]{" "}
              <strong>{selectedItem.name}</strong> for
              <span className="text-[#8d80b3] font-bold ml-1">
                {parseInt(selectedItem.buyLabel) * quantity} Coins?
              </span>
            </p>

            <div className="w-[84px] h-[84px] bg-white rounded-lg mb-8 mt-8 mx-auto"></div>

            <div className="flex justify-between mt-10">
              <button
                className="bg-white text-black px-5 py-2 rounded-full font-bold flex-1 mr-2 hover:bg-gray-200 transition-all duration-200"
                onClick={() => {
                  console.log("Purchase confirmed!", selectedItem, quantity);
                  closeModal();
                }}
              >
                Confirm Purchase
              </button>

              <button
                className="text-white hover:text-gray-200 transition-all duration-200 flex-1 ml-2 border border-white rounded-full"
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default ConfirmPurchaseModal;
