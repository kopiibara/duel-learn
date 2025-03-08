import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useUser } from '../contexts/UserContext';

const DirectSocketDebug: React.FC = () => {
    const { user } = useUser();
    const [socket, setSocket] = useState<any>(null);
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        if (!user?.firebase_uid) return;

        // Create direct socket connection bypassing service
        const newSocket = io(`${import.meta.env.VITE_BACKEND_URL}`, {
            transports: ["websocket"],
            reconnection: true
        });

        newSocket.on('connect', () => {
            log(`Direct socket connected: ${newSocket.id}`);
            newSocket.emit('setup', user.firebase_uid);
        });

        newSocket.on('connected', (data) => {
            log(`Server confirmed connection: ${JSON.stringify(data)}`);
        });

        // Listen directly for battle invitation
        newSocket.on('battle_invitation', (data) => {
            log(`⚠️ INVITATION RECEIVED: ${JSON.stringify(data)}`);
            alert(`Direct socket received invitation from ${data.senderName || 'Unknown'}`);
        });

        newSocket.on('disconnect', () => {
            log('Socket disconnected');
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user?.firebase_uid]);

    const log = (message: string) => {
        setLogs((prev) => [message, ...prev].slice(0, 10));
    };

    return (
        <div style={{
            position: 'fixed',
            top: 20,
            right: 20,
            width: 300,
            background: '#000',
            color: '#0f0',
            padding: 10,
            borderRadius: 5,
            zIndex: 9998,
            fontFamily: 'monospace',
            fontSize: 12
        }}>
            <div>Direct Socket Debug</div>
            <div>User: {user?.firebase_uid || 'Not logged in'}</div>
            <div>Socket: {socket?.connected ? 'Connected' : 'Disconnected'}</div>
            <div style={{ marginTop: 10 }}>
                <strong>Event Log:</strong>
                {logs.map((entry, i) => (
                    <div key={i} style={{ marginTop: 5, wordBreak: 'break-all' }}>
                        {entry}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DirectSocketDebug; 