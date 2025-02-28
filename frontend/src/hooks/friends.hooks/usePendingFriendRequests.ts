import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useFriendSocket } from "./useFriendSocket";

interface PendingRequest {
  friendrequest_id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  sender_info?: {
    username: string;
    level: number;
  };
}

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
        receiver_id: userId || "",
        status: "pending",
        created_at: new Date().toISOString(),
        sender_info: {
          username: data.senderUsername,
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
        setRequestsCount((prev) => Math.max(0, prev + 1));
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
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/friend/accept`,
        {
          sender_id: senderId,
          receiver_id: userId,
        }
      );

      // Update local state
      removePendingRequest(senderId);
      setRequestsCount((prev) => Math.max(0, prev - 1));

      // Emit socket event for real-time update
      if (socket && isConnected) {
        socket.emit("acceptFriendRequest", {
          sender_id: senderId,
          receiver_id: userId,
          senderInfo: {
            firebase_uid: senderId,
            username: senderUsername,
          },
          receiverInfo: response.data.senderInfo,
        });
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
