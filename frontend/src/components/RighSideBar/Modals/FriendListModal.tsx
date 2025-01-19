import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import YourFriends from "../Modals/Components/YourFriends";
import FriendRequests from "../Modals/Components/FriendRequest";
import FindFriends from "../Modals/Components/FindFriends";
import ModalIconFriendList from "../../../assets/General/ModalFriendList.png";

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
                className="bg-[#080511] border-[#3B354D] border rounded-lg w-[689px] h-[639px] max-w-full p-5 sm:p-5 md:p-9 relative flex flex-col"
                onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="text-gray-300 mb-6 hover:text-white self-end"
                >
                    <CloseIcon />
                </button>

                <div className="w-full mb-7 flex justify-center">
                    <img src={ModalIconFriendList} className="w-16" alt="Friend List" />
                </div>

                {/* Navigation Tabs */}
                <div className="flex justify-between border-b border-gray-600 mb-5">
                    <button
                        onClick={() => setActiveTab("YOUR FRIENDS")}
                        className={`flex-1 py-2 text-sm text-center ${activeTab === "YOUR FRIENDS"
                                ? "text-white border-b-2 border-[#FF6600] font-semibold"
                                : "text-gray-400 hover:text-white"
                            }`}
                    >
                        YOUR FRIENDS
                    </button>
                    <button
                        onClick={() => setActiveTab("FRIEND REQUESTS")}
                        className={`flex-1 py-2 text-sm text-center ${activeTab === "FRIEND REQUESTS"
                                ? "text-white border-b-2 border-[#FF6600] font-semibold"
                                : "text-gray-400 hover:text-white"
                            }`}
                    >
                        FRIEND REQUESTS
                    </button>
                    <button
                        onClick={() => setActiveTab("FIND FRIENDS")}
                        className={`flex-1 py-2 text-sm text-center ${activeTab === "FIND FRIENDS"
                                ? "text-white border-b-2 border-[#FF6600] font-semibold"
                                : "text-gray-400 hover:text-white"
                            }`}
                    >
                        FIND FRIENDS
                    </button>
                </div>

             {/* Content */}
<div className="p-5 rounded-md overflow-y-auto max-h-[360px] scrollbar-thin scrollbar-thumb-[#221d35] scrollbar-track-transparent">
    {activeTab === "YOUR FRIENDS" && <YourFriends />}
    {activeTab === "FRIEND REQUESTS" && <FriendRequests />}
    {activeTab === "FIND FRIENDS" && <FindFriends />}
</div>

            </div>
        </div>
    );
};

export default FriendListModal;
