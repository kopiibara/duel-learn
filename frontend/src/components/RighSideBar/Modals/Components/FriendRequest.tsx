import React from "react";

const FriendRequests: React.FC = () => {
    const requests = [
        { id: 1, name: "JohnDoe", level: 2 },
        { id: 2, name: "JaneSmith", level: 4 },
    ];

    return (
        <div>
            {requests.map((request) => (
                <div
                    key={request.id}
                    className="flex items-center justify-between mb-4 border-b border-[#3B354C] pb-4 last:border-none"
                >
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-600 rounded-[5px] mr-4"></div> {/* Avatar */}
                        <div>
                            <p className="text-white font-medium">{request.name}</p>
                            <p className="text-sm text-gray-400">LVL {request.level}</p>
                        </div>
                    </div>
                    <button className="bg-[#FF6600] text-xs text-white py-1 px-4 rounded-md">
                        ACCEPT
                    </button>
                </div>
            ))}
        </div>
    );
};

export default FriendRequests;
