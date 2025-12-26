'use client';

import React, {useContext, useEffect, useState} from 'react';

import {CurrentUserContext} from '@/context/current-user-context';
import {SocketContext} from '@/context/socket-context';
import {
    Avatar,
    AvatarGroup,
    Box,
    Button,
    Chip,
    CircularProgress, Fade,
    IconButton,
    Stack,
    Tooltip,
    Typography
} from "@mui/material";
import T from "@/context/translation";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

export default function UsersOnlineOnPage({isConnected}) {

    const {currentUser} = useContext(CurrentUserContext);
    const {socket} = useContext(SocketContext);
    const [prevUserLogin, setPrevUserLogin] = useState(null);
    const [usersOnline, setUsersOnline] = useState([]);

    const handleUsersOnline = (obj) => {
        if (typeof window !== 'undefined') {
            // Client-side-only code
            let list = usersOnline?.length > 0
                ? [...usersOnline.map(u => ({...u, hidden: true}))]
                : [];
            let path = window.location.pathname;
            for (let key in obj) {
                if (obj[key] === path) { // key !== currentUser.login &&
                    let index = list.findIndex(l => l.login === key);
                    if (index > -1) {
                        list[index].hidden = false;
                    } else {
                        list.push({
                            login: key,
                            hidden: false,
                        });
                    }
                }
            }
            setUsersOnline([...list]);
        }
    }

    const sendUserInfo = () => {
        if (socket && currentUser.login !== null && currentUser.token !== null) { // && currentUser.token?
            socket.emit('user is online', {
                login: currentUser.login,
                token: currentUser.token,
                path: window.location.pathname,
            })
        }
        if (socket && currentUser.login === null && prevUserLogin) {
            socket.emit('user is offline', {
                login: prevUserLogin,
                path: window.location.pathname,
            })
        }
    }

    useEffect(() => {
        if (currentUser.login !== null && currentUser.login !== prevUserLogin) {
            setPrevUserLogin(currentUser.login);
        }
        if (currentUser.login !== null && usersOnline.find(u => u.login === currentUser.login)) {
            setUsersOnline([...usersOnline.filter(u => u.login !== currentUser.login)]);
        }
        if ((currentUser.log === null && prevUserLogin) || (currentUser.login !== null)) {
            sendUserInfo();
        }
    }, [currentUser])
/*
    socket.on('connect', () => {
        sendUserInfo();
    })

    socket.on('online list', data => {
        handleUsersOnline(data);
    })

    socket.on('disconnect', () => {
        sendUserInfo();
    })


 */

    useEffect(() => {

        function onConnectOrDisconnect() {
            sendUserInfo();
        }
        function onOnlineList(data) {
            handleUsersOnline(data);
        }

        socket.on('connect', onConnectOrDisconnect);
        socket.on('online list', onOnlineList);
        socket.on('disconnect', onConnectOrDisconnect);

        return () => {
            socket.off('connect', onConnectOrDisconnect);
            socket.off('online list', onOnlineList);
            socket.off('disconnect', onConnectOrDisconnect);
        };
    }, []);

    if (!socket) return;

    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={1}
        >
            {
                !isConnected
                    ? (
                        <>
                            <CircularProgress size={12} disableShrink sx={{color: '#bababa'}}/>
                            <Typography variant="body2" color="#bababa" sx={{fontSize: '0.7em'}}>
                                {T('connecting', currentUser.language)}
                            </Typography>
                        </>

                    )
                    : usersOnline.filter(u => !u.hidden).length > 0
                        ? (
                            <>
                                <FiberManualRecordIcon size={12} color="success" sx={{width: '12px', height: "12px"}}/>
                                <Typography variant="body2" color="#bababa" sx={{fontSize: '0.7em'}}>
                                    {T('XpeopleHere', currentUser.language, usersOnline.filter(u => !u.hidden).length)}
                                </Typography>
                            </>
                        )
                        : ''
            }
        </Stack>
    )
}