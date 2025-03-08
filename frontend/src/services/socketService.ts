import { io, Socket } from "socket.io-client";

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private userId: string | null = null;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(userId: string): Socket {
    if (this.socket && this.userId === userId) {
      console.log("Reusing existing socket connection:", this.socket.id);
      return this.socket;
    }

    // Disconnect any existing socket
    this.disconnect();

    console.log("Creating new socket connection for user:", userId);
    this.userId = userId;
    this.socket = io(`${import.meta.env.VITE_BACKEND_URL}`, {
      transports: ["websocket"],
      reconnection: true,
      query: { userId }
    });

    this.socket.on("connect", () => {
      console.log("Socket connected with ID:", this.socket?.id);
      this.socket?.emit("setup", userId);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      console.log("Disconnecting socket:", this.socket.id);
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public sendBattleInvitation(data: {
    senderId: string;
    senderName: string;
    receiverId: string;
    lobbyCode: string;
  }): void {
    if (!this.socket) {
      console.error("Cannot send invitation: No active socket connection");
      return;
    }

    console.log("Sending battle invitation via socket:", data);
    this.socket.emit("notify_battle_invitation", {
      ...data,
      timestamp: new Date().toISOString()
    });
  }
}

export default SocketService; 