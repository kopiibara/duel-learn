import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL;

interface SocketContextType {
  socket: Socket | null;
  latestData: any; // Store real-time data received
  subscribeToEvent: (event: string, callback: (data: any) => void) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  latestData: null,
  subscribeToEvent: () => {},
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [latestData, setLatestData] = useState<any>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000, // 2s before retrying
    });

    newSocket.connect(); // Connect when mounted

    newSocket.on("connect", () => console.log(`🟢 Connected: ${newSocket.id}`));
    newSocket.on("disconnect", () =>
      console.log("🔴 Disconnected from server")
    );
    newSocket.on("connect_error", (err) =>
      console.error("❌ Connection error:", err)
    );

    // Generic event listener for any event
    newSocket.onAny((event, data) => {
      console.log(`📡 Event received: ${event}`, data);
      setLatestData({ event, data });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Function to subscribe to specific events dynamically
  const subscribeToEvent = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, latestData, subscribeToEvent }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom Hook
export const useSocket = () => useContext(SocketContext);
