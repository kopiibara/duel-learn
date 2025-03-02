import React, { useEffect, useState, useCallback } from "react";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Box, Tooltip, CircularProgress } from "@mui/material";
import axios, { AxiosError } from "axios";
import { useUser } from "../../../../contexts/UserContext";
import { useFriendList } from "../../../../hooks/friends.hooks/useFriendList";
import { useFriendSocket } from "../../../../hooks/friends.hooks/useFriendSocket";
import cauldronGif from "../../../../assets/General/Cauldron.gif";
import InviteSnackbar from "../../../../components/InviteSnackbar";
import { FriendRequestData, Friend } from "../../../../types/friend.types";

const FindFriends: React.FC = () => {
  const { user } = useUser();
  const [users, setUsers] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true); // Only for initial load
  const [searching, setSearching] = useState(false); // For showing small spinner on search
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [pendingRequests, setPendingRequests] = useState<{
    [key: string]: string;
  }>({});
  const { friendList, handleSendFriendRequest } = useFriendList(
    user?.firebase_uid
  );

  const handleFriendRequest = (data: FriendRequestData) => {
    setSnackbar({
      open: true,
      message: `${data.senderUsername} sent you a friend request!`,
    });
  };

  const handleFriendRequestSent = (data: {
    success: boolean;
    receiver_id: string;
  }) => {
    if (data.success) {
      const username = pendingRequests[data.receiver_id];
      if (username) {
        setSnackbar({
          open: true,
          message: `Friend request sent to ${username}!`,
        });
        setUsers((prevUsers) =>
          prevUsers.filter((u) => u.firebase_uid !== data.receiver_id)
        );
        setPendingRequests((prev) => {
          const { [data.receiver_id]: _, ...rest } = prev;
          return rest;
        });
      }
    }
  };

  const { sendFriendRequest } = useFriendSocket({
    userId: user?.firebase_uid,
    onFriendRequest: handleFriendRequest,
    onFriendRequestSent: handleFriendRequestSent,
  });

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const searchUsers = useCallback(
    async (query: string) => {
      if (!user?.firebase_uid) return;

      try {
        if (users.length > 0) {
          setSearching(true); // Show searching indicator
        } else {
          setLoading(true); // Show loading only on initial mount
        }

        let allUsers: Friend[] = [];

        if (query.trim() === "") {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/friend/user-info/${
              user.firebase_uid
            }`
          );
          allUsers = Array.isArray(response.data) ? response.data : [];
        } else {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/friend/search/${query}`
          );
          allUsers = Array.isArray(response.data) ? response.data : [];
        }

        const friendIds = friendList.map((friend) => friend.firebase_uid);
        const nonFriendUsers = allUsers.filter(
          (u) =>
            !friendIds.includes(u.firebase_uid) &&
            u.firebase_uid !== user.firebase_uid
        );

        setUsers([...nonFriendUsers]);
      } catch (err) {
        console.error("Search error:", {
          message: (err as AxiosError).message,
          response: (err as AxiosError).response?.data,
          status: (err as AxiosError).response?.status,
        });
        setSnackbar({ open: true, message: "Failed to search users" });
      } finally {
        setLoading(false);
        setSearching(false);
      }
    },
    [user?.firebase_uid, friendList, users.length]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchQuery.trim() === "" && users.length === 0) {
        setLoading(true);
      }
      searchUsers(searchQuery);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchQuery, searchUsers]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center">
        <img
          src={cauldronGif}
          alt="Loading..."
          style={{ width: "6rem", height: "auto" }}
        />
      </Box>
    );

  return (
    <>
      <div>
        <div className="mb-4 flex items-center">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            autoFocus
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 rounded-md bg-[#2A2A3B] text-white border border-[#3B354C] focus:outline-none focus:border-[#6F658D]"
          />
        </div>
        {users.length === 0 ? (
          <div className="text-gray-400 text-center p-4">No users found</div>
        ) : (
          users.map((otherUser) => (
            <div
              key={otherUser.firebase_uid}
              className="flex items-center justify-between mb-4 border-b border-[#3B354C] pb-4 last:border-none"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white rounded-[5px] mr-4"></div>
                <div>
                  <p className="text-lg text-[#E2DDF3]">{otherUser.username}</p>
                  <p className="text-sm text-[#9F9BAE]">
                    Level {otherUser.level}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Tooltip title="Send Friend Request" enterDelay={100} arrow>
                  <button
                    className="bg-[#5CA654] text-white py-2 px-4 rounded-md hover:scale-105 transition-all duration-300"
                    onClick={() =>
                      handleSendFriendRequest(
                        otherUser.firebase_uid,
                        otherUser.username
                      )
                    }
                  >
                    <PersonAddIcon sx={{ fontSize: 18 }} />
                  </button>
                </Tooltip>

                <Tooltip title="View Profile" enterDelay={100} arrow>
                  <button className="bg-[#3A3A8B] text-white py-2 px-4 rounded-md hover:scale-105 transition-all duration-300">
                    <VisibilityIcon sx={{ fontSize: 18 }} />
                  </button>
                </Tooltip>
              </div>
            </div>
          ))
        )}
      </div>
      <InviteSnackbar
        open={snackbar.open}
        message={snackbar.message}
        onClose={handleCloseSnackbar}
      />
    </>
  );
};

export default FindFriends;
