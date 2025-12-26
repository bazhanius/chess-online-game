"use client"
import socketio from "socket.io-client";
import {useState, createContext} from 'react';

export const SocketContext = createContext(null);

export default function SocketProvider(props) {

    let baseUrl = null;
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_ENV === 'production') {
        baseUrl = `${window?.location?.origin || ''}`;
    }

    const [socket, setSocket] = useState(
        socketio(baseUrl || process.env.NEXT_PUBLIC_WEBSOCKET_SERVER_URL, {
            path: process.env.NEXT_PUBLIC_WEBSOCKET_SERVER_PATH,
            transports: ['websocket'],
            autoConnect: false,
        })
    );
    return (
        <SocketContext.Provider
            value={{
                socket,
                setSocket
            }}
        >
            {props.children}
        </SocketContext.Provider>
    );

}