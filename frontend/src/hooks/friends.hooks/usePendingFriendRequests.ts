import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useFriendSocket } from "./useFriendSocket";
import { PendingRequest } from "../../types/friendObject";

export const usePendingFriendRequests = (userId: string | undefined) => {
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestsCount, setRequestsCount] = useState(0);

  const { socket, isConnected } = useFriendSocket({
    userId,
    onFriendRequest: (data) => {
      console.log("Socket: New friend request received", data);
      const newRequest: PendingRequest = {
        friendrequest_id: `${data.sender_id}_${Date.now()}`,
        sender_id: data.sender_id,
        sender_username: data.sender_username,
        receiver_id: userId || "",
        receiver_username: data.receiver_username || "",
        status: "pending",
        created_at: new Date().toISOString(),
        sender_info: {
          username: data.sender_username,
          level: 0,
        },
      };
      addPendingRequest(newRequest);
      setRequestsCount((prev) => prev + 1);
    },
    onFriendRequestAccepted: (data) => {
      console.log("Socket: Friend request accepted", data);
      if (data.newFriend) {
        removePendingRequest(data.newFriend.firebase_uid);
        setRequestsCount((prev) => Math.max(0, prev - 1)); // Fixed: subtract 1 instead of adding 1
      }
    },
    onFriendRequestRejected: (data) => {
      console.log("Socket: Friend request rejected", data);
      if (data.sender_id) {
        removePendingRequest(data.sender_id);
        setRequestsCount((prev) => Math.max(0, prev - 1));
      }
    },
  });

  // Add socket connection status logging
  useEffect(() => {
    console.log("Socket connection status:", isConnected);
  }, [isConnected]);

  const addPendingRequest = useCallback((request: PendingRequest) => {
    console.log("Adding pending request:", request);
    setPendingRequests((prevRequests) => {
      if (!prevRequests.some((r) => r.sender_id === request.sender_id)) {
        return [...prevRequests, request];
      }
      return prevRequests;
    });
  }, []);

  const removePendingRequest = useCallback((senderId: string) => {
    console.log("Removing pending request for sender:", senderId);
    setPendingRequests((prevRequests) =>
      prevRequests.filter((request) => request.sender_id !== senderId)
    );
  }, []);

  const fetchPendingRequests = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/friend/pending/${userId}`
      );
      const requests = Array.isArray(response.data) ? response.data : [];
      console.log("Fetched pending requests:", requests);
      setPendingRequests(requests);
      setRequestsCount(requests.length);
      setError("");
    } catch (err) {
      setError("Failed to load pending friend requests");
      console.error("Error fetching pending requests:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handleRejectRequest = async (senderId: string) => {
    if (!userId) return;

    try {
      console.log("Rejecting friend request from:", senderId);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/friend/reject`,
        {
          sender_id: senderId,
          receiver_id: userId,
        }
      );

      // Update local state immediately
      removePendingRequest(senderId);
      setRequestsCount((prev) => Math.max(0, prev - 1));

      // Emit socket event for real-time update
      if (socket && isConnected) {
        console.log("Emitting rejectFriendRequest event:", {
          sender_id: senderId,
          receiver_id: userId,
        });
        socket.emit("rejectFriendRequest", {
          sender_id: senderId,
          receiver_id: userId,
        });
      } else {
        console.log("Socket not connected, couldn't emit event");
      }
    } catch (err) {
      setError("Failed to reject friend request");
      console.error("Error rejecting friend request:", err);
      throw err;
    }
  };

  const handleAcceptRequest = async (
    senderId: string,
    senderUsername?: string
  ) => {
    if (!userId) return;

    try {
      console.log("Accepting friend request from:", senderId);

      // First get both users' information
      const [senderInfo, receiverInfo] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/friend/user-info/${senderId}`
        ),
        axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/friend/user-info/${userId}`
        ),
      ]);

      // Then accept the request
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/friend/accept`,
        {
          sender_id: senderId,
          sender_username: senderUsername || senderInfo.data.username,
          receiver_id: userId,
          receiver_username: receiverInfo.data.username,
        }
      );

      // Update local state
      removePendingRequest(senderId);
      setRequestsCount((prev) => Math.max(0, prev - 1));

      // Emit socket event for real-time update with complete user info
      if (socket && isConnected) {
        console.log("Emitting acceptFriendRequest event with user info:", {
          sender_id: senderId,
          sender_username: senderUsername || senderInfo.data.username,
          receiver_id: userId,
          receiver_username: receiverInfo.data.username,
          senderInfo: senderInfo.data,
          receiverInfo: receiverInfo.data,
        });

        socket.emit("acceptFriendRequest", {
          sender_id: senderId,
          sender_username: senderUsername || senderInfo.data.username,
          receiver_id: userId,
          receiver_username: receiverInfo.data.username,
          senderInfo: senderInfo.data,
          receiverInfo: receiverInfo.data,
        });
      } else {
        console.log(
          "Socket not connected, couldn't emit acceptFriendRequest event"
        );
      }

      return response.data;
    } catch (err) {
      setError("Failed to accept friend request");
      console.error("Error accepting friend request:", err);
      throw err;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPendingRequests();
    }
  }, [userId, fetchPendingRequests]);

  return {
    pendingRequests,
    loading,
    error,
    handleAcceptRequest,
    handleRejectRequest,
    requestsCount,
    isConnected,
  };
};
