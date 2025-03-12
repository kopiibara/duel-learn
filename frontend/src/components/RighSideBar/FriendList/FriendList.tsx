import React, { useState, useEffect } from "react";
import { Box, IconButton, Stack } from "@mui/material";
import { useUser } from "../../../contexts/UserContext";
import cauldronGif from "../../../assets/General/Cauldron.gif";
import InviteSnackbar from "../../../components/InviteSnackbar";
import Modal from "./FriendListModal";
import FriendListItem from "./FriendListItem";
import FriendListActions from "./FriendListActions";
import { useFriendList } from "../../../hooks/friends.hooks/useFriendList";
import { useFriendSocket } from "../../../hooks/friends.hooks/useFriendSocket";
import { usePendingFriendRequests } from "../../../hooks/friends.hooks/usePendingFriendRequests";
import axios from "axios";
import { SnackbarState, FriendRequestData } from "../../../types/friendObject";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import noFriend from "../../../assets/images/NoFriend.svg";
import { Friend } from "../../../contexts/UserContext";

const FriendList: React.FC = () => {
  const { user } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [localFriendList, setLocalFriendList] = useState<Friend[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    isSender: false,
    senderId: "",
  });

  // Get pending requests and handlers
  const { requestsCount, handleAcceptRequest, handleRejectRequest } =
    usePendingFriendRequests(user?.firebase_uid);

  // Update local count whenever the requestsCount changes
  useEffect(() => {
    setPendingCount(requestsCount);
  }, [requestsCount]);

  const { friendList, loading, error, handleSendFriendRequest, fetchFriends } =
    useFriendList(user?.firebase_uid);

  // Update local friend list when friendList changes
  useEffect(() => {
    if (friendList) {
      setLocalFriendList(friendList);
    }
  }, [friendList]);

  // Setup socket handlers
  const { sendFriendRequest } = useFriendSocket({
    userId: user?.firebase_uid,
    onFriendRequest: (data: FriendRequestData) => {
      setSnackbar({
        open: true,
        message: `${data.sender_username} sent you a friend request!`,
        isSender: false,
        senderId: data.sender_id,
      });

      // Force an update of the pending count
      fetchPendingRequestCount();
    },
    onFriendRequestAccepted: (data) => {
      // Update UI to show the new friend
      fetchFriends();

      // Update the pending count
      fetchPendingRequestCount();

      // Show notification
      setSnackbar({
        open: true,
        message: `You are now friends with ${
          data.otherUser.username || "a new user"
        }!`,
        isSender: true,
        senderId: "",
      });
    },
  });

  // Function to fetch pending request count directly
  const fetchPendingRequestCount = async () => {
    if (!user?.firebase_uid) return;

    try {
      const response = await axios.get<{ count: number }>(
        `${import.meta.env.VITE_BACKEND_URL}/api/friend/requests-count/${
          user.firebase_uid
        }`
      );

      const { count } = response.data;
      if (typeof count === "number") {
        setPendingCount(count);
      }
    } catch (error) {
      console.error("Error fetching pending request count:", error);
    }
  };

  // Fetch the pending count on mount
  useEffect(() => {
    if (user?.firebase_uid) {
      fetchPendingRequestCount();
    }
  }, [user?.firebase_uid]);

  const handleInvite = async (receiverId: string) => {
    if (!user?.firebase_uid || !user?.username) return;

    try {
      await handleSendFriendRequest(  
        receiverId,
        user.firebase_uid,
        user.username
      );
      sendFriendRequest({
        sender_id: user.firebase_uid,
        receiver_id: receiverId,
        sender_username: user.username,
      });

      setSnackbar({
        open: true,
        message: "Friend request sent successfully!",
        isSender: true,
        senderId: "",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message || "Error sending friend request",
        isSender: true,
        senderId: "",
      });
    }
  };

  const onAcceptFriendRequest = async (senderId: string) => {
    try {
      // Use handleAcceptRequest from usePendingFriendRequests
      await handleAcceptRequest(senderId);

      // Close the snackbar
      setSnackbar({ ...snackbar, open: false });

      // Refresh the friend list
      fetchFriends();

      // Update the pending count
      fetchPendingRequestCount();
    } catch (error: any) {
      console.error("Error accepting friend request:", error);
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message || "Error accepting friend request",
        isSender: true,
        senderId: "",
      });
    }
  };

  const handleDeclineFriendRequest = async (senderId: string) => {
    try {
      await handleRejectRequest(senderId);
      setSnackbar({ ...snackbar, open: false });
      fetchPendingRequestCount();
    } catch (error) {
      console.error("Error declining friend request:", error);
    }
  };

  const openModal = (tab: string) => {
    setActiveTab(tab);
    setModalOpen(true);

    // If opening the pending requests, refresh the count
    if (tab === "pending") {
      fetchPendingRequestCount();
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveTab("");
  };

  return (
    <>
      <Box className="rounded-[0.8rem] border-[0.2rem] border-[#3B354C] max-h-[80vh]">
        <div className="px-[2vw] pt-[4vh] pb-[2vh]">
          <div className="flex flex-row items-center mb-[2vh] gap-[0.8vw]">
            <img
              src="/bunny.png"
              className="min-w-[40px] w-[2.5vw] max-w-[56px] h-auto"
              alt="icon"
            />
            <p className="text-[clamp(1rem,1vw,2rem)] font-semibold">
              Friend List
            </p>
          </div>
          <hr className="border-t-2 border-[#3B354D] mb-[2vh]" />

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center">
              <img
                src={cauldronGif}
                alt="Loading..."
                style={{ width: "4vw", maxWidth: "4rem", height: "auto" }}
              />
            </Box>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : localFriendList.length === 0 ? (
            <Stack
              spacing={2}
              display="flex"
              justifyContent="center"
              alignItems="center"
              paddingY="2vh"
            >
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  src={noFriend}
                  alt="noFriend"
                  style={{
                    width: "8vw",
                    maxWidth: "8rem",
                    height: "auto",
                    opacity: 0.75,
                  }}
                />
              </Box>
              <p className="text-[#6F658D] font-semibold text-[1.5vh]">
                {" "}
                Add friends and share the magic!
              </p>
            </Stack>
          ) : (
            localFriendList.map((friend: Friend) => (
              <FriendListItem key={friend.firebase_uid} friend={friend} />
            ))
          )}
        </div>

        <FriendListActions
          activeTab={activeTab}
          onTabChange={openModal}
          pendingCount={pendingCount}
        />
      </Box>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onFriendRequestHandled={fetchPendingRequestCount}
      />

      <InviteSnackbar
        open={snackbar.open}
        message={snackbar.message}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        autoHideDuration={snackbar.isSender ? 3000 : 6000}
        actionButtons={
          snackbar.isSender ? undefined : (
            <>
              <IconButton
                size="small"
                aria-label="accept"
                color="inherit"
                onClick={() => onAcceptFriendRequest(snackbar.senderId)}
              >
                <CheckIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label="decline"
                color="inherit"
                onClick={() => handleDeclineFriendRequest(snackbar.senderId)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </>
          )
        }
      />
    </>
  );
};

export default FriendList;
