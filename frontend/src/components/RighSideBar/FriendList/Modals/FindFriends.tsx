import React, { useEffect, useState, useCallback } from "react";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Box, Tooltip } from "@mui/material";
import axios, { AxiosError } from "axios";
import { useUser } from "../../../../contexts/UserContext";
import { useFriendList } from "../../../../hooks/friends.hooks/useFriendList";
import { useFriendSocket } from "../../../../hooks/friends.hooks/useFriendSocket";
import cauldronGif from "../../../../assets/General/Cauldron.gif";
import InviteSnackbar from "../../../../components/InviteSnackbar";
import { FriendRequestData, Friend } from "../../../../types/friendObject";

const FindFriends: React.FC = () => {
  const { user } = useUser();
  const [users, setUsers] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const [pendingRequests, setPendingRequests] = useState<{
    [key: string]: string;
  }>({});

  // Track sent and received requests
  const [sentRequests, setSentRequests] = useState<{ [key: string]: string }>(
    {}
  );

  const { friendList, handleSendFriendRequest } = useFriendList(
    user?.firebase_uid
  );

  // Update the handleFriendRequest function to better handle incoming requests
  const handleFriendRequest = (data: FriendRequestData) => {
    console.log("Received friend request via socket:", data);

    // For the receiver, show who sent the request
    if (data.receiver_id === user?.firebase_uid) {
      console.log("Showing notification for received friend request");
      setSnackbar({
        open: true,
        message: `${data.sender_username} sent you a friend request!`,
      });
    }
  };

  const handleFriendRequestSent = (data: {
    success: boolean;
    receiver_id: string;
    receiver_username?: string;
  }) => {
    if (data.success) {
      const username =
        data.receiver_username || pendingRequests[data.receiver_id];
      if (username) {
        // Update UI to reflect that request was sent successfully
        setUsers((prevUsers) =>
          prevUsers.filter((u) => u.firebase_uid !== data.receiver_id)
        );

        // Clear from pending requests as it's been handled
        setPendingRequests((prev) => {
          const { [data.receiver_id]: _, ...rest } = prev;
          return rest;
        });
      }
    }
  };

  // Update where you initialize useFriendSocket
  const { sendFriendRequest, isConnected } = useFriendSocket({
    userId: user?.firebase_uid,
    onFriendRequest: handleFriendRequest,
    onFriendRequestSent: handleFriendRequestSent,
  });

  // Add a debug effect to log socket connection status
  useEffect(() => {
    console.log("Friend socket connection status:", isConnected);
  }, [isConnected]);

  // Add this near the top of your component
  useEffect(() => {
    console.log("FindFriends component initialized with user:", user);
    console.log("Current pending requests:", pendingRequests);
    console.log("Current sent requests:", sentRequests);
  }, [user, pendingRequests, sentRequests]);

  // Add a longer timeout for snackbar dismissal
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
        <div className="mb-8 flex items-center">
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
          users.map((otherUser) => {
            const hasPendingRequest = sentRequests[otherUser.firebase_uid];

            return (
              <div
                key={otherUser.firebase_uid}
                className="flex items-center justify-between mb-4 border-b border-[#3B354C] pb-4 last:border-none"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white rounded-[5px] mr-4"></div>
                  <div>
                    <p className="text-lg text-[#E2DDF3]">
                      {otherUser.username}
                    </p>
                    <p className="text-sm text-[#9F9BAE]">
                      Level {otherUser.level}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Tooltip
                    title={hasPendingRequest ? "Request Pending" : "Add Friend"}
                    enterDelay={100}
                    arrow
                  >
                    <button
                      className="bg-[#5CA654] text-white py-2 px-4 rounded-md hover:scale-105 transition-all duration-300"
                      onClick={() => {
                        if (!user?.firebase_uid || !user?.username) return;

                        // Update UI states first
                        setPendingRequests((prev) => ({
                          ...prev,
                          [otherUser.firebase_uid]: otherUser.username,
                        }));

                        setSentRequests((prev) => ({
                          ...prev,
                          [otherUser.firebase_uid]: otherUser.username,
                        }));

                        // Prepare request data with consistent property names
                        const requestData = {
                          sender_id: user.firebase_uid,
                          sender_username: user.username,
                          receiver_id: otherUser.firebase_uid,
                          receiver_username: otherUser.username,
                        };

                        // Show notification to the sender immediately
                        setSnackbar({
                          open: true,
                          message: `You sent a friend request to ${otherUser.username}!`,
                        });

                        // Send via socket for real-time notification
                        console.log(
                          "Sending friend request via socket:",
                          requestData
                        );
                        sendFriendRequest(requestData);

                        // Also send HTTP request for persistence
                        handleSendFriendRequest(
                          otherUser.firebase_uid,
                          user.firebase_uid,
                          user.username,
                          otherUser.username
                        ).catch((err) => {
                          console.error("Error sending friend request:", err);
                          // Show error in snackbar
                          setSnackbar({
                            open: true,
                            message:
                              "You've already sent a friend request to this user!",
                          });
                        });
                      }}
                    >
                      {sentRequests[otherUser.firebase_uid] ? (
                        "Pending"
                      ) : (
                        <PersonAddIcon sx={{ fontSize: 18 }} />
                      )}
                    </button>
                  </Tooltip>

                  <Tooltip title="View Profile" enterDelay={100} arrow>
                    <button className="bg-[#3A3A8B] text-white py-2 px-4 rounded-md hover:scale-105 transition-all duration-300">
                      <VisibilityIcon sx={{ fontSize: 18 }} />
                    </button>
                  </Tooltip>
                </div>
              </div>
            );
          })
        )}
      </div>
      <InviteSnackbar
        open={snackbar.open}
        message={snackbar.message}
        onClose={handleCloseSnackbar}
        // Increase auto-hide duration to give user more time to see the notification
        autoHideDuration={6000}
      />
    </>
  );
};

export default FindFriends;
