import React from "react";

const YourFriends: React.FC = () => {
    const friends = [
        { id: 1, name: "PeraltaMalakas", level: 1 },
        { id: 2, name: "CJdimarunong", level: 6 },
    ];

    return (
        <div>
            {friends.map((friend) => (
                <div
                    key={friend.id}
                    className="flex items-center justify-between mb-4 border-b border-[#3B354C] pb-4 last:border-none"
                >
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-600 rounded-[5px] mr-4"></div> {/* Avatar */}
                        <div>
                            <p className="text-white font-medium">{friend.name}</p>
                            <p className="text-sm text-gray-400">LVL {friend.level}</p>
                        </div>
                    </div>
                    <button className="bg-[#FF4A4A] text-xs text-white py-1 px-4 rounded-md hover:bg-[#E84040]">
                        REMOVE
                    </button>
                </div>
            ))}
        </div>
    );
};

export default YourFriends;
