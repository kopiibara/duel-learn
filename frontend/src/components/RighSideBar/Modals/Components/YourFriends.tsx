import React from "react";
import CloseIcon from "@mui/icons-material/Close";

const YourFriends: React.FC = () => {
    const friends = [
        { id: 1, name: "PeraltaMalakas", level: 1 },
        { id: 2, name: "CJdimarunong", level: 6 },
        { id: 1, name: "PeraltaMalakas", level: 1 },
        { id: 2, name: "CJdimarunong", level: 6 },
        { id: 1, name: "PeraltaMalakas", level: 1 },
        { id: 2, name: "CJdimarunong", level: 6 },
    ];

    // Pending function
    const handleClick = (id: number) => {
        console.log("Pending action for friend with ID:", id);
    };

    return (
        <div>
            {friends.map((friend) => (
                <div
                    key={friend.id}
                    className="flex items-center justify-between mb-4 border-b border-[#3B354C] pb-4 last:border-none"
                >
                    <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleClick(friend.id)}
                    >
                        <div className="w-12 h-12 bg-white rounded-[5px] mr-4"></div> {/* Avatar */}
                        <div>
                            <p className="text-white font-medium">{friend.name}</p>
                            <p className="text-sm text-gray-400">LVL {friend.level}</p>
                        </div>
                    </div>

                    <button className="bg-[#E03649] text-xs text-white py-2 px-4 rounded-md hover:bg-[#E84040]">
                        <CloseIcon sx={{ fontSize: 20 }} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default YourFriends;
