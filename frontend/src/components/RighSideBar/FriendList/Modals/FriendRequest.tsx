import React from "react";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

const FriendRequests: React.FC = () => {
    const requests = [
        { id: 1, name: "JohnDoe", level: 2 },
        { id: 2, name: "JaneSmith", level: 4 },
        { id: 1, name: "JohnDoe", level: 2 },
        { id: 2, name: "JaneSmith", level: 4 },
        { id: 1, name: "JohnDoe", level: 2 },
        { id: 2, name: "JaneSmith", level: 4 },
    ];

    // Pending function
    const handleClick = (id: number) => {
        console.log("Pending action for request with ID:", id);
    };

    return (
        <div>
            {requests.map((request) => (
                <div
                    key={request.id}
                    className="flex items-center justify-between mb-4 border-b border-[#3B354C] pb-4 last:border-none"
                >
                    <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleClick(request.id)}
                    >
                        <div className="w-12 h-12 bg-white rounded-[5px] mr-4"></div> {/* Avatar */}
                        <div>
                            <p className="text-white font-medium">{request.name}</p>
                            <p className="text-sm text-gray-400">LVL {request.level}</p>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        <button className="bg-[#5CA654] text-xs text-white py-2 px-4 rounded-md">
                            <CheckIcon sx={{ fontSize: 20 }} />
                        </button>
                        <button className="bg-[#E43B45] text-xs text-white py-2 px-4 rounded-md">
                            <CloseIcon sx={{ fontSize: 20 }} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FriendRequests;
