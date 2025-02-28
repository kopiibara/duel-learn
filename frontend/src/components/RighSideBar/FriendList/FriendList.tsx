import React, { useState } from "react";
import { Box, IconButton } from "@mui/material";
import { useUser } from "../../../contexts/UserContext";
import cauldronGif from "../../../assets/General/Cauldron.gif";
import InviteSnackbar from "../../../components/InviteSnackbar";
import Modal from "./FriendListModal";
import FriendListItem from "./FriendListItem";
import FriendListActions from "./FriendListActions";
import { useFriendList } from "../../../hooks/friends.hooks/useFriendList";

import { useFriendSocket } from "../../../hooks/friends.hooks/useFriendSocket";
import {
  SnackbarState,
  FriendRequestData,
  Friend,
} from "../../../types/friend.types";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

const FriendList: React.FC = () => {
  const { user } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [localFriendList, setLocalFriendList] = useState<Friend[]>([]);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    isSender: false,
    senderId: "",
  });

  const {
    friendList,
    loading,
    error,
    handleSendFriendRequest,
    handleAcceptFriendRequest,
  } = useFriendList(user?.firebase_uid);

  // Update local friend list when friendList changes
  React.useEffect(() => {
    if (friendList) {
      setLocalFriendList(friendList);
    }
  }, [friendList]);

  const { sendFriendRequest } = useFriendSocket({
    userId: user?.firebase_uid,
    onFriendRequest: (data: FriendRequestData) => {
      setSnackbar({
        open: true,
        message: `${data.senderUsername} sent you a friend request!`,
        isSender: false,
        senderId: data.sender_id,
      });
    },
  });

  const { socket } = useFriendSocket({
    userId: user?.firebase_uid,
    onFriendRequest: () => {},
  });

  React.useEffect(() => {
    if (!socket) return;

    socket.on("friendRequestAccepted", ({ newFriend }) => {
      // Update the friend list with the new friend
      setLocalFriendList((prevList) => {
        if (
          !prevList.some(
            (friend) => friend.firebase_uid === newFriend.firebase_uid
          )
        ) {
          return [...prevList, newFriend];
        }
        return prevList;
      });
    });

    return () => {
      socket.off("friendRequestAccepted");
    };
  }, [socket]);

  const handleInvite = async (receiverId: string) => {
    if (!user?.firebase_uid || !user?.username) return;

    try {
      await handleSendFriendRequest(receiverId, user.firebase_uid);
      sendFriendRequest({
        sender_id: user.firebase_uid,
        receiver_id: receiverId,
        senderUsername: user.username,
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
      await handleAcceptFriendRequest(senderId, user?.firebase_uid || "");
      setSnackbar({
        open: true,
        message: "Friend request accepted!",
        isSender: true,
        senderId: "",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message || "Error accepting friend request",
        isSender: true,
        senderId: "",
      });
    }
  };

  const handleDeclineFriendRequest = (senderId: string) => {
    console.log("Declining friend request from:", senderId);
    setSnackbar({ ...snackbar, open: false });
  };

  const openModal = (tab: string) => {
    setActiveTab(tab);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveTab("");
  };

  return (
    <>
      <Box className="rounded-[1rem] shadow-md border-[0.25rem] border-[#3B354C]">
        <div className="px-8 pt-8 pb-5">
          <div className="flex flex-row items-center mb-5 gap-4">
            <img src="/bunny.png" className="w-[41px] h-[35px]" alt="icon" />
            <h2 className="text-xl text-[#FFFFFF] font-semibold">
              Friend List
            </h2>
          </div>
          <hr className="border-t-1 border-[#3B354D] mb-7" />

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center">
              <img
                src={cauldronGif}
                alt="Loading..."
                style={{ width: "4rem", height: "auto" }}
              />
            </Box>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            localFriendList.map((friend: Friend) => (
              <FriendListItem
                key={friend.firebase_uid}
                friend={friend}
                onInvite={handleInvite}
              />
            ))
          )}
        </div>

        <FriendListActions activeTab={activeTab} onTabChange={openModal} />
      </Box>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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
