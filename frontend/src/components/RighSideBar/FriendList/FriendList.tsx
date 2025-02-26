import React, { useState, useEffect } from "react";
import Profile from "../../../assets/profile-picture/bunny-picture.png";
import ProfileIcon from "../../../assets/profile-picture/kopibara-picture.png";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import Modal from "./FriendListModal";
import { Button, Box, Tooltip, Stack, Divider } from "@mui/material";
import axios from "axios";
import { useUser } from "../../../contexts/UserContext";
import cauldronGif from "../../../assets/General/Cauldron.gif";
import ErrorsSnackbar from "../../../components/ErrorsSnackbar";
import { io, Socket } from "socket.io-client";

const FriendList: React.FC = () => {
  const { user } = useUser();
  const [friendList, setFriendList] = useState<
    Array<{
      firebase_uid: string;
      username: string;
      display_profile: string;
      level: number;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
  });

  // Add socket state
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (user?.firebase_uid) {
      const newSocket = io(import.meta.env.VITE_BACKEND_URL);

      // Set up the socket connection
      newSocket.emit("setup", user.firebase_uid);

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    }
  }, [user?.firebase_uid]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/friend/info/${
            user?.firebase_uid
          }`
        );
        setFriendList(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError("Failed to load friends");
        console.error("Error fetching friends:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [user]);

  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("");

  const openModal = (tab: string) => {
    setActiveTab(tab); // Set the active tab dynamically
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveTab(""); // Reset the active tab when modal closes
  };

  // Update the socket listener for friend requests
  useEffect(() => {
    if (socket) {
      socket.on(
        "newFriendRequest",
        (data: { sender_id: string; senderUsername: string }) => {
          setSnackbar({
            open: true,
            message: `${data.senderUsername} sent you a friend request!`,
          });
        }
      );

      return () => {
        socket.off("newFriendRequest");
      };
    }
  }, [socket]);

  const handleSendFriendRequest = async (receiverId: string) => {
    if (!user?.firebase_uid || !receiverId) {
      console.error("Error: sender_id or receiver_id is missing!");
      setSnackbar({
        open: true,
        message: "Invalid user ID. Please try again.",
      });
      return;
    }

    const requestData = {
      sender_id: user.firebase_uid,
      receiver_id: receiverId,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/friend/request`,
        requestData,
        { headers: { "Content-Type": "application/json" } }
      );

      setSnackbar({ open: true, message: "Friend request sent successfully!" });

      // Emit the socket event with the correct event name
      if (socket?.connected) {
        socket.emit("sendFriendRequest", {
          ...requestData,
          senderUsername: user.username,
        });
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message || "Error sending friend request",
      });
    }
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
            friendList.map((friend) => (
              <div
                key={friend.firebase_uid}
                className="flex items-center justify-between mb-6"
              >
                <div className="flex items-center">
                  <img
                    src={friend.display_profile || ProfileIcon}
                    alt="Avatar"
                    className="w-14 h-14 rounded-[5px] mr-6 hover:scale-110 transition-all duration-300"
                  />
                  <div>
                    <p className="text-lg text-[#E2DDF3]">{friend.username}</p>
                    <p className="text-sm text-[#9F9BAE]">
                      Level {friend.level}
                    </p>
                  </div>
                </div>
                <Button
                  variant="contained"
                  onClick={() => handleSendFriendRequest(friend.firebase_uid)}
                  sx={{
                    borderRadius: "0.8rem",
                    padding: "0.4rem 1.3rem",
                    display: "flex",
                    width: "full",
                    justifyContent: "center",
                    alignItems: "center",
                    transition: "all 0.3s ease", // Smooth transition for hover effects
                    backgroundColor: "#52A647",
                    borderWidth: "2px",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  INVITE
                </Button>
              </div>
            ))
          )}
        </div>

        <Stack
          direction={"row"}
          spacing={1}
          className="flex justify-between bg-[#120F1C] py-6 px-4 border-t-[0.25rem] rounded-b-[0.8rem] border-[#3B354C]"
        >
          <Tooltip title="Your Friends" placement="top" enterDelay={100}>
            <button
              onClick={() => openModal("YOUR FRIENDS")}
              className={`flex items-center justify-center hover:scale-110 hover:text-[#A38CE6] transition-all duration-300 flex-1 ${
                activeTab === "YOUR FRIENDS"
                  ? "text-[#A38CE6]"
                  : "text-[#3B354D]"
              }`}
            >
              <PeopleIcon />
            </button>
          </Tooltip>
          <Divider orientation="vertical" variant="middle" flexItem />
          <Tooltip title="Friend Requests" placement="top" enterDelay={100}>
            <button
              onClick={() => openModal("FRIEND REQUESTS")}
              className={`flex items-center justify-center  hover:scale-110 hover:text-[#A38CE6] transition-all duration-300 flex-1 ${
                activeTab === "FRIEND REQUESTS"
                  ? "text-[#A38CE6]"
                  : "text-[#3B354D]"
              }`}
            >
              <PersonAddIcon />
            </button>
          </Tooltip>

          <Divider orientation="vertical" variant="middle" flexItem />
          <Tooltip title="Find Friends" placement="top" enterDelay={100}>
            <button
              onClick={() => openModal("FIND FRIENDS")}
              className={`flex items-center justify-center  hover:scale-110 hover:text-[#A38CE6] transition-all duration-300 flex-1 ${
                activeTab === "FIND FRIENDS"
                  ? "text-[#A38CE6]"
                  : "text-[#3B354D]"
              }`}
            >
              <PersonSearchIcon />
            </button>
          </Tooltip>
        </Stack>
      </Box>
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        activeTab={activeTab} // Pass the active tab to the modal
        setActiveTab={setActiveTab} // Pass the setter function to allow tab switching in the modal
      />
      <ErrorsSnackbar
        open={snackbar.open}
        message={snackbar.message}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </>
  );
};

export default FriendList;
