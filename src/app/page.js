'use client';
import {useRouter} from 'next/navigation'
import {ThemeProvider, createTheme, useColorScheme} from '@mui/material/styles';
import styles from "./page.module.css";
import {
    Badge,
    Box,
    Button,
    Tab,
    Tabs,
    List,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Stack,
    Alert,
    Backdrop, CircularProgress, ListItemAvatar, Avatar
} from "@mui/material";
import React, {Suspense, useContext, useEffect, useState} from 'react';

// Icons
import GroupsIcon from '@mui/icons-material/Groups';
import LoginIcon from '@mui/icons-material/Login';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MemoryIcon from '@mui/icons-material/Memory';

import {CurrentUserContext} from '@/context/current-user-context';
import {SocketContext} from '@/context/socket-context';
import Header from "@/components/ui/Header";
import T from "@/context/translation";

// Dayjs
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
import 'dayjs/locale/en';
import 'dayjs/locale/ru';
import 'dayjs/locale/zh-cn';
import Loading from "@/components/ui/Loading";

dayjs.locale('en');

const theme = createTheme({
    colorSchemes: {
        dark: true,
    },
});

function Home() {

    const router = useRouter();
    const {currentUser, setCurrentUser} = useContext(CurrentUserContext);
    const {socket} = useContext(SocketContext);
    const [isConnected, setIsConnected] = useState(true);

    const handleIsConnected = (value) => {
        setIsConnected(value);
    }

    const [games, setGames] = useState([]);

    useEffect(() => {
        if (socket) {
            socket.emit('online list', {});
            socket.emit('list of games', {});
        }
    }, []);

    useEffect(() => {

        socket.on('list of games', (data) => {

            let newGames = [];
            let currentUserGame = null;

            if (Object.keys(data).length !== 0) {
                for (const key in data) {
                    if (currentUser.login !== null
                        && (data[key].players.black === currentUser.login
                            || data[key].players.white === currentUser.login)) {
                        currentUserGame = key;
                        setIsLoading(true);
                    }

                    newGames.push({
                        id: key,
                        name: data[key].name,
                        players: data[key].players,
                        moves: data[key].moves,
                        status: data[key].status,
                        date: data[key].date
                    })
                }
            }

            setGames(newGames);

            if (currentUserGame) {
                router.push(`${process.env.NEXT_PUBLIC_ASSET_PREFIX}game?id=${currentUserGame}`);
            }
        });

    }, [socket, currentUser, router]);


    const {mode, setMode} = useColorScheme('dark');

    const [tabIndex, setTabIndex] = useState('0');
    const handleTabChange = () => {
        setTabIndex(tabIndex === '0' ? '1' : '0')
    }

    const [isLoading, setIsLoading] = useState(false);

    const handleCreateLobbyGame = (mode) => {
        if (currentUser.login !== null && currentUser.token !== null) {
            socket.emit('user is online', {
                login: currentUser.login,
                token: currentUser.token,
                path: window.location.pathname,
            });
            socket.emit('create game', {
                login: currentUser.login,
                token: currentUser.token,
                mode: mode,
                name: 'chess'
            });
        } else {
            // нужно авторизоваться?
        }
    };

    const handleJoinGame = (game) => {
        const c = currentUser;
        //if (c.login === null) return;
        if (c.login !== null && c.token !== null) {
            // Присоединяемся к игре
            if (c.login !== null && c.login !== game.players.white && game.players.black === null) {
                socket.emit("join game", {
                    login: c.login,
                    token: c.token,
                    gameId: game.id
                });
            }
            router.push(`${process.env.NEXT_PUBLIC_ASSET_PREFIX}game?id=${game.id}`);
        } else {
            // Посмотреть как играют другие
            if (game.players.white !== null && game.players.black !== null) {
                router.push(`${process.env.NEXT_PUBLIC_ASSET_PREFIX}game?id=${game.id}`);
            }
        }
    }

    useEffect(() => {
        if (currentUser.language === 'zh') {
            dayjs.locale('zh-cn');
        } else {
            dayjs.locale(currentUser.language);
        }
    }, [currentUser])

    if (!currentUser.language) {
        return (
            <Backdrop
                sx={(theme) => ({color: '#fff', zIndex: theme.zIndex.drawer + 2})}
                open={true}
                //onClick={handleClose}
            >
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                    minHeight: '100px',
                }}>
                    <CircularProgress color="inherit"/>
                </Box>

            </Backdrop>
        )
    }

    return (
        <ThemeProvider theme={theme} defaultMode="dark" noSsr>
            <Backdrop
                sx={(theme) => ({color: '#fff', zIndex: theme.zIndex.drawer + 2})}
                open={isLoading}
            >
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                    minHeight: '100px',
                }}>
                    <CircularProgress disableShrink color="inherit"/>
                </Box>
            </Backdrop>
            <Box sx={{width: '100%'}}>
                <Header type='main' gameId={null} handleIsConnected={handleIsConnected}/>
            </Box>
            <Stack spacing={2} sx={{p: 2}}>
                <Button
                    fullWidth
                    variant="contained"
                    startIcon={<GroupsIcon/>}
                    onClick={() => handleCreateLobbyGame('PvP')}
                    disabled={currentUser.login === null || !isConnected}
                    size="small"
                    sx={{whiteSpace: 'nowrap'}}
                >
                    {T('createLobbyGame', currentUser.language)}
                </Button>
                <Button
                    fullWidth
                    variant="contained"
                    startIcon={<MemoryIcon/>}
                    onClick={() => handleCreateLobbyGame('PvE')}
                    disabled={currentUser.login === null || !isConnected}
                    size="small"
                    sx={{whiteSpace: 'nowrap'}}
                >
                    {T('playAgainstComputer', currentUser.language)}
                </Button>
            </Stack>
            <Box sx={{width: '100%', pt: 3, pl: 2, pr: 2, borderBottom: 1, borderColor: 'divider'}}>
                <Tabs
                    onChange={handleTabChange}
                    value={tabIndex}
                    variant="fullWidth"
                >
                    <Tab label={
                        <Badge
                            color="primary"
                            overlap="rectangular"
                            badgeContent={games?.filter(g => g.name === 'chess' && g.status === 'starting').length || 0}
                            showZero={false}
                        >
                            <Box sx={{pr: 1, pl: 1}}>
                                {T('lobby', currentUser.language)}
                            </Box>
                        </Badge>
                    } value="0"/>
                    <Tab label={
                        <Badge
                            color="primary"
                            overlap="rectangular"
                            badgeContent={games?.filter(g => g.name === 'chess' && g.status === 'ongoing').length || 0}
                            showZero={false}>
                            <Box sx={{pr: 1, pl: 1}}>
                                {T('currentGames', currentUser.language)}
                            </Box>
                        </Badge>
                    } value="1"/>
                </Tabs>
            </Box>

            <Box sx={{width: '100%', textAlign: 'center', p: 0}}>
                {
                    !currentUser.login && tabIndex === '0'
                        ? <Alert
                            severity="info"
                            sx={{m: 2, alignContent: 'left'}}
                            //variant="outlined"
                            //action={<Button color="inherit" size="small">Войти</Button>}
                        >
                            {T('signInAlert', currentUser.language)}
                        </Alert>
                        : ''
                }
                {
                    tabIndex === '0' && games.filter(g => g.name === 'chess' && g.status === 'starting').length === 0
                        ? (
                            currentUser.login && <Alert
                                severity="info"
                                sx={{m: 2}}
                                //variant="outlined"
                                //action={<Button color="inherit" size="small">Создать</Button>}
                            >
                                {T('createLobbyGameAlert', currentUser.language)}
                            </Alert>
                        )
                        : ''
                }

                {
                    tabIndex === '1' && games.filter(g => g.name === 'chess' && g.status === 'ongoing').length === 0
                        ? (
                            <Alert
                                severity="info"
                                sx={{m: 2}}
                                //variant="outlined"
                            >
                                {T('currentGamesAlert', currentUser.language)}
                            </Alert>
                        )
                        : ''
                }
            </Box>

            <Box sx={{width: '100%'}}>
                {
                    games && games.length > 0
                    && <List sx={{width: '100%'}} component="nav">
                        {games.filter(g => g.name === 'chess' && g.status === (tabIndex === '0' ? 'starting' : 'ongoing')).map((game, index) => (
                            <ListItemButton
                                key={index}
                                onClick={(e) => handleJoinGame(game)}
                            >
                                {
                                    game.status === 'starting' && <ListItemAvatar>
                                        <Avatar>
                                            {[...game.players.white][0].toUpperCase()}
                                        </Avatar>
                                    </ListItemAvatar>
                                }
                                <ListItemText
                                    primary={
                                        game.status === 'starting'
                                            ? <><b>{game.players.white}</b></>
                                            : <><b>{game.players.white}</b> {T('versus', currentUser.language)} <b>{game.players.black !== 'Computer' ? game.players.black : T('computer', currentUser.language)}</b></>
                                    }
                                    secondary={
                                        game.status === 'starting'
                                            ? <>{dayjs(game.date.created_at).locale(currentUser.language === 'zh' ? 'zh-cn' : currentUser.language).fromNow()}</>
                                            : <>{dayjs(game.date.started_at).locale(currentUser.language === 'zh' ? 'zh-cn' : currentUser.language).fromNow()}</>
                                    }
                                />
                                <ListItemIcon>
                                    {
                                        game.status === 'starting'
                                            ? <LoginIcon/>
                                            : <VisibilityIcon/>
                                    }
                                </ListItemIcon>
                            </ListItemButton>
                        ))}
                    </List>
                }

            </Box>

        </ThemeProvider>
    );
}

function HomePage({children}) {
    return (
        <Suspense fallback={<Loading/>}>
            <Home>{children}</Home>
        </Suspense>
    );
}

export default HomePage;
