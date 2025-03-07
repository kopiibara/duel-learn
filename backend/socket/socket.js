import { Server } from 'socket.io';
import { setupBattleInvitationHandlers } from './battleInvitationHandlers.js';

export const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            methods: ["GET", "POST"]
        }
    });

    // Create connectedUsers map at module scope
    const connectedUsers = new Map();

    // Create a function to handle battle invitations that has access to connectedUsers
    const battleInvitationHandler = setupBattleInvitationHandlers(io, connectedUsers);

    io.on('connection', (socket) => {
        console.log('New socket connection:', socket.id);

        socket.on('register_user', (firebase_uid) => {
            if (!firebase_uid) {
                console.error('No firebase_uid provided for registration');
                return;
            }

            // Store user mapping
            connectedUsers.set(firebase_uid, socket.id);
            console.log('User registration:', {
                firebase_uid,
                socketId: socket.id,
                totalConnected: connectedUsers.size,
                allUsers: Array.from(connectedUsers.entries())
            });

            // Join user's room
            socket.join(firebase_uid);

            // Verify room join
            const userRoom = io.sockets.adapter.rooms.get(firebase_uid);
            console.log('Room status:', {
                userId: firebase_uid,
                roomExists: !!userRoom,
                socketCount: userRoom?.size || 0,
                allRooms: Array.from(io.sockets.adapter.rooms.keys())
            });
        });

        socket.on('disconnect', () => {
            // Remove user from tracking
            for (const [uid, sid] of connectedUsers.entries()) {
                if (sid === socket.id) {
                    connectedUsers.delete(uid);
                    console.log(`User ${uid} disconnected, remaining users:`,
                        Array.from(connectedUsers.entries()));
                    break;
                }
            }
        });

        // Set up event handlers with access to connectedUsers
        battleInvitationHandler(socket);
    });

    return io;
}; 