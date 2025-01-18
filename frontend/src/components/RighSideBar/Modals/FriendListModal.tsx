import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import YourFriends from "../Modals/Components/YourFriends";
import FriendRequests from "../Modals/Components/FriendRequest";
import FindFriends from "../Modals/Components/FindFriends";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeTab: string;
    setActiveTab: (tab: string) => void; // Function to update active tab in the parent
}

const FriendListModal: React.FC<ModalProps> = ({ isOpen, onClose, activeTab, setActiveTab }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            {/* Backdrop */}
            <div
                className="absolute inset-0"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div
                className="bg-[#120F1C] rounded-lg w-[90%] max-w-md shadow-xl p-6 relative"
                onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-300 hover:text-white"
                >
                    <CloseIcon />
                </button>

                {/* Navigation Tabs */}
                <div className="flex justify-between border-b border-gray-600 mb-5">
                    <button
                        onClick={() => setActiveTab("YOUR FRIENDS")}
                        className={`flex-1 py-2 text-sm text-center ${
                            activeTab === "YOUR FRIENDS"
                                ? "text-white border-b-2 border-[#FF6600] font-semibold"
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        YOUR FRIENDS
                    </button>
                    <button
                        onClick={() => setActiveTab("FRIEND REQUESTS")}
                        className={`flex-1 py-2 text-sm text-center ${
                            activeTab === "FRIEND REQUESTS"
                                ? "text-white border-b-2 border-[#FF6600] font-semibold"
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        FRIEND REQUESTS
                    </button>
                    <button
                        onClick={() => setActiveTab("FIND FRIENDS")}
                        className={`flex-1 py-2 text-sm text-center ${
                            activeTab === "FIND FRIENDS"
                                ? "text-white border-b-2 border-[#FF6600] font-semibold"
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        FIND FRIENDS
                    </button>
                </div>

                {/* Content */}
                <div className="bg-[#1B1625] p-5 rounded-md overflow-y-auto max-h-[300px]">
                    {activeTab === "YOUR FRIENDS" && <YourFriends />}
                    {activeTab === "FRIEND REQUESTS" && <FriendRequests />}
                    {activeTab === "FIND FRIENDS" && <FindFriends />}
                </div>
            </div>
        </div>
    );
};

export default FriendListModal;
