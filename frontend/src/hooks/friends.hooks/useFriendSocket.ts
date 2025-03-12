import { useState, useEffect } from "react";
import { Socket, io } from "socket.io-client";
import { FriendRequestData } from "../../types/friendObject";

interface UseFriendSocketProps {
  userId: string | undefined;
  onFriendRequest?: (data: FriendRequestData) => void;
  onFriendRequestAccepted?: (data: any) => void;
  onFriendRequestRejected?: (data: any) => void;
  onFriendRemoved?: (data: { removedFriendId: string }) => void;
  onFriendRequestSent?: (data: {
    success: boolean;
    receiver_id: string;
    receiver_username?: string;
  }) => void;
}

export const useFriendSocket = ({
  userId,
  onFriendRequest,
  onFriendRequestAccepted,
  onFriendRequestRejected,
  onFriendRemoved,
  onFriendRequestSent,
}: UseFriendSocketProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (userId) {
      const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on("connect", () => {
        console.log("Socket connected, setting up for user:", userId);
        setIsConnected(true);
        newSocket.emit("setup", userId);
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected for user:", userId);
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error for user:", userId, error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        console.log("Cleaning up socket for user:", userId);
        newSocket.close();
        setIsConnected(false);
      };
    }
  }, [userId]);

  useEffect(() => {
    if (!socket) return;

    console.log("Setting up socket event listeners for user:", userId);

    // Listen for incoming friend requests
    if (onFriendRequest) {
      socket.on("newFriendRequest", (data) => {
        console.log("Socket received newFriendRequest event:", data);
        onFriendRequest(data);
      });
    }

    // Listen for friend request accepted events
    if (onFriendRequestAccepted) {
      socket.on("friendRequestAccepted", (data) => {
        console.log("Received friendRequestAccepted event:", data);
        onFriendRequestAccepted(data);
      });
    }

    // Listen for friend request rejected events
    if (onFriendRequestRejected) {
      socket.on("friendRequestRejected", onFriendRequestRejected);
    }

    // Listen for friend removed events
    if (onFriendRemoved) {
      socket.on("friendRemoved", onFriendRemoved);
    }

    // Listen for friend request sent confirmation
    if (onFriendRequestSent) {
      socket.on("friendRequestSent", (data) => {
        console.log("Received friendRequestSent event:", data);
        onFriendRequestSent(data);
      });
    } else {
      socket.on(
        "friendRequestSent",
        (data: { success: boolean; receiver_id: string }) => {
          console.log("Received friendRequestSent event (no handler):", data);
          if (data.success) {
            console.log("Friend request sent successfully via socket");
          }
        }
      );
    }

    // Listen for socket errors
    socket.on(
      "error",
      (error: { type: string; message: string; details: string }) => {
        console.error("Socket error for user:", userId, error);
      }
    );

    return () => {
      console.log("Cleaning up socket event listeners for user:", userId);
      socket.off("newFriendRequest");
      socket.off("friendRequestAccepted");
      socket.off("friendRequestRejected");
      socket.off("friendRemoved");
      socket.off("friendRequestSent");
      socket.off("error");
    };
  }, [
    socket,
    onFriendRequest,
    onFriendRequestAccepted,
    onFriendRequestRejected,
    onFriendRemoved,
    onFriendRequestSent,
    userId,
  ]);

  // Update the sendFriendRequest function to ensure all required data is sent
  // Update the sendFriendRequest function to ensure all required data is sent
  const sendFriendRequest = (requestData: {
    sender_id: string;
    receiver_id: string;
    sender_username: string;
    receiver_username?: string;
  }) => {
    if (socket?.connected) {
      // Validate the required fields before sending
      if (
        !requestData.sender_id ||
        !requestData.receiver_id ||
        !requestData.sender_username
      ) {
        console.error("Missing required data for friend request:", requestData);
        return;
      }

      console.log("Sending friend request:", requestData);
      socket.emit("sendFriendRequest", {
        sender_id: requestData.sender_id,
        receiver_id: requestData.receiver_id,
        sender_username: requestData.sender_username,
        receiver_username: requestData.receiver_username,
      });
    } else {
      console.error("Socket not connected when trying to send friend request");
    }
  };

  // Update the acceptFriendRequest function
  const acceptFriendRequest = (data: {
    sender_id: string;
    sender_username: string;
    receiver_id: string;
    receiver_username: string;
    senderInfo?: any;
    receiverInfo?: any;
  }) => {
    if (socket?.connected) {
      console.log("Emitting acceptFriendRequest socket event:", data);
      socket.emit("acceptFriendRequest", data);
    } else {
      console.error(
        "Socket not connected when trying to accept friend request"
      );
    }
  };

  const rejectFriendRequest = (data: {
    sender_id: string;
    receiver_id: string;
  }) => {
    if (socket?.connected) {
      socket.emit("rejectFriendRequest", data);
    } else {
      console.error("Socket not connected");
    }
  };

  const removeFriend = (data: { sender_id: string; receiver_id: string }) => {
    if (socket?.connected) {
      socket.emit("removeFriend", data);
    } else {
      console.error("Socket not connected");
    }
  };

  return {
    socket,
    isConnected,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
  };
};
