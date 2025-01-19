import React from "react";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import VisibilityIcon from "@mui/icons-material/Visibility";

const FindFriends: React.FC = () => {
    const friends = [
        { id: 1, name: "Alice", level: 3 },
        { id: 2, name: "Bob", level: 5 },
        { id: 3, name: "Charlie", level: 4 },
        { id: 4, name: "David", level: 2 },
        { id: 5, name: "Eve", level: 6 },
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

                    <div className="flex space-x-2">
                        <button className="bg-[#5CA654] text-white py-2 px-4 rounded-md">
                            <PersonAddIcon sx={{ fontSize: 18 }} />
                        </button>
                        <button className="bg-[#3A3A8B] text-white py-2 px-4 rounded-md">
                            <VisibilityIcon sx={{ fontSize: 18 }} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FindFriends;
