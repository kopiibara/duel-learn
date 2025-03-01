import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Friend } from "../../types/friend.types";
import { useFriendSocket } from "./useFriendSocket";

export const useFriendList = (userId: string | undefined) => {
  const [friendList, setFriendList] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const addFriend = useCallback((newFriend: Friend) => {
    setFriendList((prevList) => {
      if (
        !prevList.some(
          (friend) => friend.firebase_uid === newFriend.firebase_uid
        )
      ) {
        return [...prevList, newFriend];
      }
      return prevList;
    });
  }, []);

  const removeFriend = useCallback((friendId: string) => {
    setFriendList((prevList) =>
      prevList.filter((friend) => friend.firebase_uid !== friendId)
    );
  }, []);

  const {
    socket,
    isConnected,
    acceptFriendRequest,
    removeFriend: emitRemoveFriend,
  } = useFriendSocket({
    userId,
    onFriendRequestAccepted: (data) => {
      addFriend(data.newFriend);
    },
    onFriendRemoved: (data) => {
      removeFriend(data.removedFriendId);
    },
  });

  const fetchFriends = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/friend/friend-info/${userId}`
      );
      setFriendList(Array.isArray(response.data) ? response.data : []);
      setError("");
    } catch (err) {
      setError("Failed to load friends");
      console.error("Error fetching friends:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handleSendFriendRequest = async (
    receiverId: string,
    senderId: string
  ) => {
    if (!senderId || !receiverId) {
      throw new Error("Invalid user ID. Please try again.");
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/friend/request`,
        { sender_id: senderId, receiver_id: receiverId },
        { headers: { "Content-Type": "application/json" } }
      );

      return response;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        throw new Error(
          error.response.data.message || "Failed to send friend request"
        );
      }
      throw error;
    }
  };

  const handleAcceptFriendRequest = async (
    senderId: string,
    receiverId: string
  ) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/friend/accept`,
        { sender_id: senderId, receiver_id: receiverId },
        { headers: { "Content-Type": "application/json" } }
      );

      if (socket && isConnected) {
        acceptFriendRequest({
          sender_id: senderId,
          receiver_id: receiverId,
          senderInfo: response.data.senderInfo,
          receiverInfo: response.data.receiverInfo,
        });
      }

      return response;
    } catch (error) {
      console.error("Error accepting friend request:", error);
      throw error;
    }
  };

  const handleRemoveFriend = async (senderId: string, receiverId: string) => {
    try {
      // Optimistically remove the friend from the list
      removeFriend(receiverId);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/friend/remove`,
        { sender_id: senderId, receiver_id: receiverId },
        { headers: { "Content-Type": "application/json" } }
      );

      if (socket && isConnected) {
        emitRemoveFriend({
          sender_id: senderId,
          receiver_id: receiverId,
        });
      }

      return response;
    } catch (error) {
      console.error("Error removing friend:", error);
      // If there's an error, refresh the friend list to ensure consistency
      await fetchFriends();
      throw error;
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [userId, fetchFriends]);

  return {
    friendList,
    loading,
    error,
    fetchFriends,
    handleSendFriendRequest,
    handleAcceptFriendRequest,
    handleRemoveFriend,
    addFriend,
    removeFriend,
    isConnected,
  };
};
