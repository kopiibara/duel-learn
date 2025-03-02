export interface Friend {
  firebase_uid: string;
  username: string;
  display_profile: string;
  level: number;
}

export interface SnackbarState {
  open: boolean;
  message: string;
  isSender: boolean;
  senderId: string;
}

export interface FriendRequestData {
  sender_id: string;
  senderUsername: string;
}

export interface PendingRequest {
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
