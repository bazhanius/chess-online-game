'use client';
import {
    AppBar,
    Badge,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    IconButton,
    Menu,
    MenuList,
    Tab,
    Tabs,
    TextField,
    Toolbar,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Drawer,
    ToggleButtonGroup,
    ToggleButton,
    ListItemIcon,
    Avatar,
    Fade,
    Tooltip, MenuItem, ListSubheader, Paper, FormControl, InputLabel, Select, CircularProgress
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import React, {useContext, useEffect, useState} from "react";
import {SocketContext} from '@/context/socket-context';
import {CurrentUserContext} from '@/context/current-user-context';
import {ConnectionManager} from '@/components/ws/ConnectionManager';

import SvgIcon from '@mui/material/SvgIcon';

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import HelpIcon from '@mui/icons-material/Help';
import FeedbackIcon from '@mui/icons-material/Feedback';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import LanguageIcon from '@mui/icons-material/Language';
import CheckIcon from '@mui/icons-material/Check';
import InfoIcon from '@mui/icons-material/Info';

import UsersOnlineOnPage from "@/components/ws/UsersOnlineOnPage";
import {useRouter, useSearchParams} from "next/navigation";
import LanguageMenu from "@/components/ui/LanguageMenu";
import T from "@/context/translation";
import ComputerStrengthMenu from "@/components/ui/ComputerStrengthMenu";


export default function Header({type, gameId, gameInfo, handleSetIsUserLeftGame, handleIsConnected}) {

    const router = useRouter();

    const {socket} = useContext(SocketContext);
    const {currentUser, setCurrentUser} = useContext(CurrentUserContext);

    const [inputValue, setInputValue] = useState("");

    const handleOnChange = (e) => {
        setIsWrongTokenError(false);
        setInputValue(e.target.value.replace(/[\\\.\+\*\?\^\$\[\]\(\)\{\}\/\'\#\:\!\=\|\<\>\"\'\%\&]/ig, ""));
    }

    const [open, setOpen] = useState(false);
    const handleClickOpen = () => {
        setIsSubmittingLogin(false);
        setIsWrongTokenError(false);
        setOpen(true);
        setInputValue('');
    };
    const handleClose = () => {
        setIsSubmittingLogin(false);
        setIsWrongTokenError(false);
        setOpen(false);
        //setIsLoading(true); /// ???
    };

    const handleGoToRoot = () => {
        router.push(process.env.NEXT_PUBLIC_ASSET_PREFIX);
    };

    const handleExitGame = (e) => {
        setIsSubmittingLogin(false);
        setIsWrongTokenError(false);
        handleSetIsUserLeftGame(true);

        // Запоминаем статистику только при выходе из игры
        if (currentUser.stats?.chess) {
            let tempStats = JSON.parse(JSON.stringify(currentUser.stats.chess));
            if (gameInfo && gameInfo.players
                && (gameInfo.players?.white === currentUser.login || gameInfo.players?.black === currentUser.login)) {
                // Game not finished
                if (gameInfo.status === 'ongoing') {
                    // Resigning is always loosing
                    if (gameInfo.mode === 'PvP') {
                        tempStats['PvP']['L'] = currentUser.stats.chess['PvP']['L'] + 1;
                    } else if (gameInfo.mode === 'PvE') {
                        tempStats['PvE']['L'] = currentUser.stats.chess['PvE']['L'] + 1;
                    }
                } else if (gameInfo.status === 'finished') {
                    if (gameInfo.result === 'draw') {
                        if (gameInfo.mode === 'PvP') {
                            tempStats['PvP']['D'] = currentUser.stats.chess['PvP']['D'] + 1;
                        } else if (gameInfo.mode === 'PvE') {
                            tempStats['PvE']['D'] = currentUser.stats.chess['PvE']['D'] + 1;
                        }
                    } else if ((gameInfo.result === 'black won' && currentUser.login === gameInfo.players.black)
                        || (gameInfo.result === 'white won' && currentUser.login === gameInfo.players.white)) {
                        if (gameInfo.mode === 'PvP') {
                            tempStats['PvP']['W'] = currentUser.stats.chess['PvP']['W'] + 1;
                        } else if (gameInfo.mode === 'PvE') {
                            tempStats['PvE']['W'] = currentUser.stats.chess['PvE']['W'] + 1;
                        }
                    } else if ((gameInfo.result === 'black won' && currentUser.login === gameInfo.players.white)
                        || (gameInfo.result === 'white won' && currentUser.login === gameInfo.players.black)) {
                        if (gameInfo.mode === 'PvP') {
                            tempStats['PvP']['L'] = currentUser.stats.chess['PvP']['L'] + 1;
                        } else if (gameInfo.mode === 'PvE') {
                            tempStats['PvE']['L'] = currentUser.stats.chess['PvE']['L'] + 1;
                        }
                    }
                }
                setCurrentUser({
                    ...currentUser,
                    stats: {
                        ...currentUser.stats,
                        chess: tempStats
                    }
                });
            }
        }

        socket.emit('leave game', {
            login: currentUser.login,
            token: currentUser.token,
            gameId: gameId,
        });
        router.push(process.env.NEXT_PUBLIC_ASSET_PREFIX);
    }

    useEffect(() => {
        //const localStorageUser = JSON.parse(localStorage.getItem('bazhanius-lan-games')) || null;
        localStorage.setItem('bazhanius-lan-games', JSON.stringify(currentUser));
    }, [currentUser, setCurrentUser]);

    const [isConnected, setIsConnected] = useState(socket.connected);
    const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
    const [isWrongTokenError, setIsWrongTokenError] = useState(false);

    const handleSubmitLogin = (event) => {
        event.preventDefault();
        setIsSubmittingLogin(true);
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        const username = formJson.username;

        /*
        setCurrentUser(prevState => {
            return {...prevState, login: username}
        });
         */

        socket.emit('user is online', {
            login: username,
            path: window.location.pathname,
        });
    };

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
            if (handleIsConnected) {
                handleIsConnected(true)
            }
            ;
        }

        function onDisconnect() {
            setIsConnected(false);
            if (handleIsConnected) {
                handleIsConnected(false)
            }
            ;
        }

        function onUseTokenEvent(data) {
            setCurrentUser(prevState => {
                return {...prevState, login: data.login, token: data.token}
            });
            handleClose();
        }

        function onWrongTokenEvent(data) {
            if (!open) {
                setIsWrongTokenError(true);
            } else {
                setIsWrongTokenError(false);
            }
            setIsSubmittingLogin(false);
            // Logout
            if (
                currentUser.login !== null
                && currentUser.login === data?.login
                && currentUser.token !== data?.token
            ) {
                //localStorage.removeItem('bazhanius-lan-games');
                setCurrentUser(prevState => {
                    return {
                        ...prevState,
                        login: null,
                        token: null
                    }
                });
            }
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('use token', onUseTokenEvent);
        socket.on('wrong token', onWrongTokenEvent);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('use token', onUseTokenEvent);
            socket.off('wrong token', onWrongTokenEvent);
        };
    }, []);

    // User Menu

    const [anchorEl, setAnchorEl] = React.useState(null);
    const userMenuOpen = Boolean(anchorEl);
    const handleUserMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleUserMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        const cu = currentUser;
        localStorage.removeItem('bazhanius-lan-games');

        setCurrentUser(prevState => {
            return {...prevState, login: null, token: null}
        });

        if (cu.login !== null && cu.token !== null) {
            // Leave current game
            if (gameId) {
                setIsSubmittingLogin(false);
                setIsWrongTokenError(false);
                handleSetIsUserLeftGame(true);

                socket.emit('leave game', {
                    login: cu.login,
                    token: cu.token,
                    gameId: gameId,
                });
            }
            // Logout
            socket.emit('logout', {
                login: cu.login,
                token: cu.token,
            });
            if (gameId) router.push(process.env.NEXT_PUBLIC_ASSET_PREFIX);
        }
        handleUserMenuClose();
    }

    // Drawer
    const [openDrawer, setOpenDrawer] = React.useState(false);
    const toggleDrawer = (newOpen) => () => {
        setOpenDrawer(newOpen);
    };

    return (
        <>
            <Drawer open={openDrawer} onClose={toggleDrawer(false)}>
                <Box
                    sx={{width: 250}}
                    role="presentation"
                    //onClick={toggleDrawer(false)}
                >
                    <ListSubheader
                        sx={{backgroundColor: 'inherit'}}
                    >
                        Настройки
                    </ListSubheader>
                    <LanguageMenu/>
                    <ComputerStrengthMenu/>
                    <Divider/>
                    <ListSubheader
                        sx={{backgroundColor: 'inherit'}}
                    >
                        Информация
                    </ListSubheader>
                    <List>
                        <ListItem disablePadding>
                            <ListItemButton>
                                <ListItemIcon>
                                    <HelpIcon/>
                                </ListItemIcon>
                                <ListItemText primary={T('faq', currentUser.language)}/>
                            </ListItemButton>
                        </ListItem>
                    </List>
                    <List>
                        <ListItem disablePadding>
                            <ListItemButton>
                                <ListItemIcon>
                                    <FeedbackIcon/>
                                </ListItemIcon>
                                <ListItemText primary={T('feedback', currentUser.language)}/>
                            </ListItemButton>
                        </ListItem>
                    </List>
                    <List>
                        <ListItem disablePadding>
                            <ListItemButton>
                                <ListItemIcon>
                                    <InfoIcon/>
                                </ListItemIcon>
                                <ListItemText primary={T('aboutGame', currentUser.language)}/>
                            </ListItemButton>
                        </ListItem>
                    </List>
                    <Divider/>
                    <Box sx={{color: '#bababa', p: 2}}>
                        <Typography variant="caption">© 2025 Alexander Bazhanov</Typography>
                    </Box>
                </Box>
            </Drawer>
            <Box sx={{width: '100%', p: 1, display: 'flex', flexDirection: 'row', alignContent: 'center'}}>
                <Box sx={{alignContent: 'center',}}>
                    {
                        type && type === 'main' && <Box sx={{pl: 1}}>
                            <SvgIcon sx={{width: '32px', height: "32px"}}>
                                <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#fff"><path d="M160-80v-194.67q77.67-61.66 120.67-135.66t66.66-158.34h-38.66q-27 0-46.84-19.83Q242-608.33 242-635.33V-880h189.33v122h97.34v-122H718v244.67q0 27-19.83 46.83-19.84 19.83-46.84 19.83h-39q23 84.34 66.34 158.34Q722-336.33 800-274.67V-80H160Zm66.67-66.67h506.66v-95Q646.67-320.33 603.5-410.5q-43.17-90.17-60.17-158.17H415.67q-16.67 68-60 158.17-43.34 90.17-129 168.83v95Zm82-488.66h342.66v-178h-56v122H364.67v-122h-56v178ZM480-146.67ZM308.67-635.33H651.33 308.67Z"/></svg>
                            </SvgIcon>
                        </Box>
                    }
                    {
                        type && type === 'game' && <>
                            <Button
                                variant="text"
                                startIcon={<ArrowBackIosIcon/>}
                                onClick={(e) => handleExitGame(e)}
                            >
                                {
                                    gameInfo && gameInfo.players && gameInfo.status === 'ongoing' &&
                                    (gameInfo.players?.white === currentUser.login || gameInfo.players?.black === currentUser.login)
                                        ? T('resign', currentUser.language)
                                        : T('withdraw', currentUser.language)
                                }
                            </Button>
                        </>
                    }
                    {
                        type && (type === 'stats' || type === 'about') && <>
                            <Button
                                variant="text"
                                startIcon={<ArrowBackIosIcon/>}
                                onClick={(e) => handleGoToRoot(e)}
                            >
                                {T('back', currentUser.language)}
                            </Button>
                        </>
                    }

                </Box>

                <Box sx={{flexGrow: 1, alignContent: 'center', textAlign: 'center'}}>
                    <Typography variant="subtitle2"></Typography>
                </Box>
                <Box sx={{pl: 1, pr: 2, alignContent: 'center',}}>
                    <UsersOnlineOnPage isConnected={isConnected}/>
                </Box>
                <Divider
                    orientation="vertical"
                    variant="middle"
                    sx={{borderColor: 'rgba(255,255,255,0.1)'}}
                    flexItem
                />
                <Box sx={{
                    p: 0,
                    m: 0,
                    display: 'flex',
                    justifyContent: 'end',
                    alignContent: 'center',
                    //minWidth: '90px',
                    alignItems: 'center',
                    textAlign: 'center',
                }}>
                    {
                        currentUser.login
                            ? <>
                                <Box sx={{display: 'flex', alignItems: 'center', textAlign: 'center'}}>
                                    <Tooltip title={currentUser.login}>
                                        <IconButton
                                            onClick={handleUserMenuClick}
                                            size="small"
                                            sx={{ml: 2}}
                                            //aria-controls={open ? 'account-menu' : undefined}
                                            //aria-haspopup="true"
                                            //aria-expanded={open ? 'true' : undefined}
                                        >
                                            <Avatar
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    // Add a system emoji font to the stack as a fallback
                                                    //fontFamily: 'Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, Android Emoji, Symbola, sans-serif',
                                                }}
                                            >
                                                {[...currentUser.login][0].toUpperCase()}
                                            </Avatar>
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <Menu
                                    anchorEl={anchorEl}
                                    id="account-menu"
                                    open={userMenuOpen}
                                    onClose={handleUserMenuClose}
                                    //onClick={handleUserMenuClose}
                                    transformOrigin={{horizontal: 'right', vertical: 'top'}}
                                    anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                                >
                                    <ListSubheader sx={{
                                        background: 'inherit',
                                        pl: 1,
                                        pr: 1,
                                        pb: 2,
                                        pt: 1,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        color: 'inherit',
                                        minWidth: 'min(50vw, 250px)'
                                    }}>
                                        <Typography variant="h6">{currentUser.login}</Typography>
                                    </ListSubheader>
                                    <Divider/>
                                    <MenuItem onClick={handleLogout} sx={{mt: 1}}>
                                        <ListItemIcon>
                                            <Logout fontSize="small"/>
                                        </ListItemIcon>
                                        {T('logOut', currentUser.language)}
                                    </MenuItem>
                                    <Divider/>
                                    <ListSubheader
                                        sx={{backgroundColor: 'inherit'}}
                                    >
                                        {T('settings', currentUser.language)}
                                    </ListSubheader>
                                    <LanguageMenu/>
                                    <ComputerStrengthMenu/>
                                    <Divider/>
                                    <ListSubheader
                                        sx={{backgroundColor: 'inherit'}}
                                    >
                                        {T('sections', currentUser.language)}
                                    </ListSubheader>
                                    <MenuItem
                                        sx={{mt: 1}}
                                        disabled={window.location.pathname.includes('stats')}
                                        onClick={() => router.push(`${process.env.NEXT_PUBLIC_ASSET_PREFIX}stats`)}
                                    >
                                        <ListItemIcon>
                                            <LeaderboardIcon fontSize="small"/>
                                        </ListItemIcon>

                                        <ListItemText>{T('stats', currentUser.language)}</ListItemText>
                                        <ArrowForwardIosIcon fontSize="small"/>
                                    </MenuItem>
                                </Menu>
                            </>
                            : <>
                                <Button onClick={handleClickOpen}>
                                    {T('signIn', currentUser.language)}
                                </Button>
                                <Dialog
                                    sx={{width: '100%', minWidth: '100%'}}
                                    open={open}
                                    onClose={handleClose}
                                    fullWidth={true}
                                >
                                    <DialogTitle>
                                        {T('signIn', currentUser.language)}
                                    </DialogTitle>
                                    <DialogContent>
                                        <DialogContentText>
                                        </DialogContentText>
                                        <form onSubmit={handleSubmitLogin} id="login">
                                            <TextField
                                                autoFocus
                                                required
                                                margin="dense"
                                                id="name"
                                                name="username"
                                                label={T('username', currentUser.language)}
                                                type="text"
                                                fullWidth
                                                variant="standard"
                                                error={isWrongTokenError}
                                                helperText={T(isWrongTokenError ? 'usernameIsInUseOrProhibited' : 'usernameHelperText', currentUser.language)}
                                                onChange={(e) => handleOnChange(e)}
                                                value={inputValue}
                                                slotProps={{
                                                    htmlInput: {
                                                        minLength: 3,
                                                        maxLength: 16,
                                                        //pattern: "^[\\p{Script=Latin}\\p{Script=Cyrillic}\\p{Emoji}\\s]*$"
                                                    },
                                                }}
                                            />
                                        </form>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleClose}>
                                            {T('cancel', currentUser.language)}
                                        </Button>

                                        <Box sx={{m: 1, position: 'relative'}}>
                                            <Button
                                                type="submit"
                                                form="login"
                                                variant="contained"
                                                disabled={isSubmittingLogin}
                                                //onClick={handleSubmitLogin}
                                            >
                                                {T('submit', currentUser.language)}
                                            </Button>
                                            {isSubmittingLogin && (
                                                <CircularProgress
                                                    size={24}
                                                    disableShrink
                                                    sx={{
                                                        //color: '#fff',
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '50%',
                                                        marginTop: '-12px',
                                                        marginLeft: '-12px',
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    </DialogActions>
                                </Dialog>
                            </>
                    }
                </Box>
            </Box>
            <Box>
                <ConnectionManager isConnected={isConnected}/>
            </Box>
        </>
    );
}