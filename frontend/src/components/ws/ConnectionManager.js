'use client';

import React, {useEffect, useContext} from 'react';
import {SocketContext} from '@/context/socket-context';

export function ConnectionManager({isConnected}) {

    const {socket} = useContext(SocketContext);

    function connect() {
        socket.connect();
    }

    function disconnect() {
        socket.disconnect();
    }

    useEffect(() => {
        if (!isConnected) {
            connect();
        }
    }, [isConnected]);

    return null;

    return (
        <>
            <button onClick={connect}>Connect</button>
            <button onClick={disconnect}>Disconnect</button>
        </>
    );
}