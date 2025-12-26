'use client';
import {useRouter, useSearchParams} from 'next/navigation';
import {ThemeProvider, createTheme, useColorScheme} from '@mui/material/styles';
import React, {useRef, useEffect, useState, useContext, useCallback, Suspense} from 'react';
import {Chessground} from '@lichess-org/chessground';
import {Chess} from 'chess.js';
import '../../../public/css/chessground.base.css';
import '../../../public/css/chessground.brown.css';
import '../../../public/css/chessground.cburnett.css';
import {Alert, Backdrop, Box, Button, Chip, CircularProgress, Paper, Snackbar, Stack, Typography} from "@mui/material";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {CurrentUserContext} from "@/context/current-user-context";
import {SocketContext} from '@/context/socket-context';
import Header from "@/components/ui/Header";
import MovesList from "@/components/ui/MovesList";
import T from "@/context/translation";
import D from "@/context/stockfish-difficulty";
import Loading from "@/components/ui/Loading";

const theme = createTheme({
    colorSchemes: {
        dark: true,
    },
});

// Stockfish Web Worker
class StockfishEngine {
    constructor() {
        this.wasmSupported = typeof WebAssembly === 'object' && WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
        this.worker = new Worker(
            this.wasmSupported
                ? process.env.NEXT_PUBLIC_ASSET_PREFIX + 'js/stockfish.wasm.js'
                : process.env.NEXT_PUBLIC_ASSET_PREFIX + 'js/stockfish.js'
        );
        this.onMessage = null;
        this.initialized = false;
        this.uciElo = 100;
        this.skillLevel = 0;
        this.depth = 1;
        this.moveTime = 500;
        this.limitStrength = true;

        this.worker.onmessage = (event) => {
            if (this.onMessage) {
                this.onMessage(event.data);
            }
        };
    }

    init() {
        this.sendCommand('uci');
        this.sendCommand('isready');
        this.initialized = true;
    }

    setDifficulty(difficulty) {
        const d = D(difficulty); // generate random params
        //console.log(d);
        this.uciElo = d.uciElo;
        this.skillLevel = d.skillLevel;
        this.depth = d.depth;
        this.moveTime = d.moveTime;
        this.limitStrength = d.limitStrength;

        this.sendCommand(`setoption name Skill Level value ${this.skillLevel}`);
        this.sendCommand(`setoption name UCI_LimitStrength value ${this.limitStrength}`);
        if (this.uciElo) {
            this.sendCommand(`setoption name UCI_Elo value ${this.uciElo}`);
        }

        //this.sendCommand('setoption name Skill Level Maximum Error value 0.1');
        //this.sendCommand('setoption name Skill Level Probability value 0.1');
    }

    sendCommand(command) {
        this.worker.postMessage(command);
    }

    setPosition(fen, moves = []) {
        let command = `position fen ${fen}`;
        if (moves.length > 0) {
            command = `position fen ${fen} moves ${moves.join(' ')}`;
        }
        this.sendCommand(command);
    }

    getBestMove() {
        this.sendCommand('stop');
        if (this.skillLevel <= 3) {
            this.sendCommand(`go depth ${this.depth}`);
        } else if (this.skillLevel <= 8) {
            this.sendCommand(`go depth ${this.depth} movetime ${this.moveTime}`);
        } else {
            this.sendCommand(`go movetime ${this.moveTime}`);
        }
    }

    stop() {
        this.sendCommand('stop');
    }

    destroy() {
        this.worker.terminate();
    }
}

function Game() {
    const router = useRouter();
    const {currentUser, setCurrentUser} = useContext(CurrentUserContext);
    const {socket} = useContext(SocketContext);
    const handleReloadPage = () => {
        window.location.reload();
    }

    const searchParams = useSearchParams();
    const gameId = searchParams.get('id');

    const [isUserLeftGame, setIsUserLeftGame] = useState(false);
    const handleSetIsUserLeftGame = (value) => {
        setIsUserLeftGame(true);
        if (isUserLeftGame !== value) {
            setIsUserLeftGame(value);
        }
    }

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadGameError, setIsLoadGameError] = useState(false);

    const [chess, setChess] = useState(new Chess());
    const [gameInfo, setGameInfo] = useState({});
    const [pgn, setPgn] = useState('');
    const [playerColor, setPlayerColor] = useState(null);
    const [currentTurn, setCurrentTurn] = useState('white');
    const [lastMove, setLastMove] = useState([]);
    const [status, setStatus] = useState();

    // Состояния для игры с компьютером
    const [stockfish, setStockfish] = useState(null);
    const [isComputerThinking, setIsComputerThinking] = useState(false);
    const [computerMove, setComputerMove] = useState(null);

    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const boardRef = useRef(null);
    const cgRef = useRef(null);
    const initializedRef = useRef(false);

    // Проверяем, это игра с компьютером
    const isComputerGame = gameInfo.players?.black === 'Computer';

    // Инициализация Stockfish для игры с компьютером
    useEffect(() => {
        if (isComputerGame && !stockfish) {
            const engine = new StockfishEngine();
            engine.init();

            engine.onMessage = (data) => {
                if (data.startsWith('bestmove')) {
                    const parts = data.split(' ');
                    if (parts[1] && parts[1] !== '(none)') {
                        const bestMove = parts[1];
                        setComputerMove(bestMove);
                    }
                    setIsComputerThinking(false);
                }
            };

            engine.setDifficulty(currentUser.computerStrength || 0);

            setStockfish(engine);
        }

        return () => {
            if (stockfish) {
                stockfish.destroy();
            }
        };
    }, [isComputerGame]);

    // Проверка, должен ли компьютер ходить
    useEffect(() => {
        if (isComputerThinking && !chess.isGameOver()) {
            if (!stockfish || !isComputerGame || chess.isGameOver() || isMyTurn || playerColor === null) return;

            stockfish.setPosition(chess.fen());
            // slightly change settings sometimes
            if (Math.random() < 0.2) {
                stockfish.setDifficulty(currentUser.computerStrength || 0);
            }
            stockfish.getBestMove();
        }
    }, [chess, stockfish, isComputerGame, isComputerThinking]);

    useEffect(() => {
        if (socket) {
            socket.emit('list of games', {});
        }
    }, [])

    // Determine player color based on game info and current user
    useEffect(() => {
        if (gameInfo.players && currentUser.login) {
            if (gameInfo.players.white === currentUser.login) {
                setPlayerColor('white');
            } else if (gameInfo.players.black === currentUser.login) {
                setPlayerColor('black');
            } else {
                // Нет игры или проблема с загрузкой?
            }
        }
    }, [gameInfo, currentUser]);

    // Update current turn when chess state changes
    useEffect(() => {
        setCurrentTurn(chess.turn() === 'w' ? 'white' : 'black');
        if (isComputerGame && chess.turn() === 'b') {
            setIsComputerThinking(true);
        }
    }, [chess]);

    // Check if it's the current player's turn
    const isMyTurn = playerColor === currentTurn;
    const isPlaying = gameInfo
        && gameInfo.status === 'ongoing'
        && gameInfo.players
        && gameInfo.players.white !== null
        && gameInfo.players.black !== null;

    // Memoize getDests to prevent unnecessary recalculations
    const getDests = useCallback(() => {
        const dests = new Map();
        for (let i = 0; i < 64; i++) {
            const file = 'abcdefgh'[i % 8];
            const rank = Math.floor(i / 8) + 1;
            const square = file + rank;
            const moves = chess.moves({
                square: square,
                verbose: true
            });
            if (moves.length > 0) {
                dests.set(square, moves.map(move => move.to));
            }
        }
        return dests;
    }, [chess]);

    // Memoize game status check
    const checkGameStatus = useCallback(() => {
        let status = '';
        let statusClass = 'normal';
        let gameOver = false;

        if (chess.isCheckmate()) {
            status = `${T('checkmate', currentUser.language)}. ${chess.turn() === 'w' ? T('blackWinsGame', currentUser.language) : T('whiteWinsGame', currentUser.language)}`;
            statusClass = 'checkmate';
            gameOver = true;
        } else if (chess.isStalemate()) {
            status = `${T('stalemate', currentUser.language)}. ${T('draw', currentUser.language)}`;
            statusClass = 'draw';
            gameOver = true;
        } else if (chess.isInsufficientMaterial()) {
            status = `${T('insufficientMaterial', currentUser.language)}. ${T('draw', currentUser.language)}`;
            statusClass = 'draw';
            gameOver = true;
        } else if (chess.isThreefoldRepetition()) {
            status = `${T('threefoldRepetition', currentUser.language)}. ${T('draw', currentUser.language)}`;
            statusClass = 'draw';
            gameOver = true;
        } else if (chess.isDraw()) {
            status = `${T('draw', currentUser.language)} ${T('by50MoveRule', currentUser.language)}`;
            statusClass = 'draw';
            gameOver = true;
        } else if (chess.isCheck()) {
            status = `${chess.turn() === 'w' ? T('whiteIsInCheck', currentUser.language) : T('blackIsInCheck', currentUser.language)}!`;
            statusClass = 'check';
        } else {
            status = `${chess.turn() === 'w' ? T('whitesTurn', currentUser.language) : T('blacksTurn', currentUser.language)}`;
            statusClass = 'normal';
        }

        if (gameOver || !isComputerThinking) {
            if (stockfish && isComputerGame) {
                stockfish.stop();
            }
        }

        return {
            gameOver: gameOver,
            status: status,
            isCheck: chess.isCheck(),
            isCheckmate: chess.isCheckmate(),
            isDraw: chess.isDraw()
        };
    }, [chess]);

    // Handle moves properly
    const onMove = useCallback((orig, dest) => {
        if (!isMyTurn) {
            return false;
        }

        try {
            const piece = chess.get(orig);

            if (piece && (
                (playerColor === 'white' && piece.color !== 'w') ||
                (playerColor === 'black' && piece.color !== 'b')
            )) {
                return false;
            }

            let moveResult;

            if (piece && piece.type === 'p' &&
                ((piece.color === 'w' && dest[1] === '8') ||
                    (piece.color === 'b' && dest[1] === '1'))) {
                moveResult = chess.move({from: orig, to: dest, promotion: 'q'});
            } else {
                moveResult = chess.move({from: orig, to: dest});
            }

            if (moveResult) {
                setLastMove([orig, dest]);

                const newChess = new Chess();
                newChess.loadPgn(chess.pgn());
                setChess(newChess);
                setPgn(newChess.pgn());

                socket.emit('update game', {
                    gameId: gameId,
                    login: currentUser.login,
                    token: currentUser.token,
                    pgn: newChess.pgn(),
                });

                return true;
            }
            return false;
        } catch (e) {
            console.error('Invalid move:', e);
            return false;
        }
    }, [chess, socket, gameId, currentUser, isMyTurn, isPlaying, playerColor]);

    useEffect(() => {
        if (!computerMove || isMyTurn || playerColor === null) return;

        try {
            const moveResult = chess.move(computerMove);
            if (moveResult) {
                setLastMove([moveResult.from, moveResult.to]);

                const newChess = new Chess();
                newChess.loadPgn(chess.pgn());
                setChess(newChess);
                setPgn(newChess.pgn());

                // Отправляем ход компьютера через вебсокет для зрителей
                socket.emit('update game', {
                    gameId: gameId,
                    login: currentUser.login,
                    token: currentUser.token,
                    pgn: newChess.pgn(),
                });

                setIsComputerThinking(false);
                setComputerMove(null);
            }
        } catch (e) {
            console.error('Computer move error:', e);
        }

    }, [computerMove, isComputerThinking]);

    // Initialize Chessground only once
    useEffect(() => {
        if (boardRef.current && !initializedRef.current) {
            initializedRef.current = true;

            const gameStatus = checkGameStatus();

            cgRef.current = Chessground(boardRef.current, {
                fen: chess.fen(),
                turnColor: currentTurn,
                orientation: playerColor || 'white',
                movable: {
                    color: isMyTurn || isPlaying ? playerColor : null,
                    free: false,
                    dests: isMyTurn ? getDests() : new Map(),
                    events: {
                        after: onMove
                    }
                },
                draggable: {
                    showGhost: true,
                    deleteOnDropOff: true
                },
                animation: {
                    enabled: true,
                    duration: 300
                },
                highlight: {
                    lastMove: true,
                    check: true
                },
                premovable: {
                    enabled: false,
                },
                drawable: {
                    enabled: true,
                }
            });
        }

        return () => {
            if (cgRef.current) {
                cgRef.current.destroy();
                cgRef.current = null;
                initializedRef.current = false;
            }
        };
    }, []); // Empty dependency array - initialize only once

    // Update board when relevant state changes
    useEffect(() => {
        if (!cgRef.current) return;

        const gameStatus = checkGameStatus();

        cgRef.current.set({
            fen: chess.fen(),
            turnColor: currentTurn,
            orientation: playerColor || 'white',
            movable: {
                color: (gameStatus.gameOver || !isMyTurn || !isPlaying) ? null : playerColor,
                free: false,
                dests: (gameStatus.gameOver || !isMyTurn) ? new Map() : getDests(),
                events: {
                    after: onMove
                }
            },
            check: gameStatus.isCheck,
            lastMove: lastMove,
            animation: {
                enabled: true,
                duration: 300
            }
        });
        setStatus(gameStatus);

        if (gameStatus.gameOver && gameInfo.status !== 'finished') {
            socket.emit('game over', {
                gameId: gameId,
                login: currentUser.login,
                token: currentUser.token,
            });
        }

        if (gameInfo.status === 'finished') {
            setSnackbarOpen(true);
        }

    }, [chess, currentTurn, isMyTurn, isPlaying, playerColor, lastMove, checkGameStatus, getDests, onMove]);

    // Socket listeners
    useEffect(() => {
        const handleGameList = (games) => {

            if (gameId in games) {
                if (isLoadGameError) setIsLoadGameError(false);
                if (isLoading) setIsLoading(false);

                const gameData = games[gameId];
                setGameInfo(gameData);

                if (gameData.pgn !== pgn && gameData.pgn.length > pgn.length) {
                    setPgn(gameData.pgn);
                    const newChess = new Chess();
                    newChess.loadPgn(gameData.pgn);

                    const moves = newChess.history({verbose: true});
                    if (moves.length > 0) {
                        const lastMove = moves[moves.length - 1];
                        setLastMove([lastMove.from, lastMove.to]);
                    }

                    setChess(newChess);
                }
            } else {
                if (isUserLeftGame) {
                    if (!isLoading) setIsLoading(true);
                } else {
                    if (!isLoadGameError) setIsLoadGameError(true);
                }
            }
            //if (isLoading === true) setIsLoading(false);
        };

        socket.on('list of games', handleGameList);

        return () => {
            socket.off('list of games', handleGameList);
        };
    }, [socket, gameId, pgn, isUserLeftGame]);

    // Load PGN when it changes (from server)
    useEffect(() => {
        if (pgn) {
            const newChess = new Chess();
            try {
                newChess.loadPgn(pgn);
                setChess(newChess);
            } catch (e) {
                console.error('Error loading PGN:', e);
            }
        }
    }, [pgn]);

    if (isLoadGameError) {
        return (
            <Backdrop
                sx={(theme) => ({color: '#fff', zIndex: theme.zIndex.drawer + 1})}
                open={true}
                //onClick={handleClose}
            >
                <Box sx={{display: 'flex', alignItems: 'center', flexDirection: 'column', gap: '24px'}}>
                    <Stack spacing={2} direction="column" sx={{p: 3}}>
                        <Typography variant="h6">
                            {T('errorLoadingPageTitle', currentUser.language)}
                        </Typography>
                        <Typography variant="subtitle1">
                            {T('errorLoadingPageDescription', currentUser.language)}
                        </Typography>
                    </Stack>
                    <Stack spacing={2} direction="column">
                        <Button variant="contained" onClick={() => router.push(process.env.NEXT_PUBLIC_ASSET_PREFIX)}>
                            {T('toMainPage', currentUser.language)}
                        </Button>
                        <Button variant="outlined" onClick={(e) => handleReloadPage(e)}>
                            {T('reload', currentUser.language)}
                        </Button>
                    </Stack>
                </Box>
            </Backdrop>

        )
    }

    return (
        <ThemeProvider theme={theme} defaultMode="dark" noSsr>
            <Backdrop
                sx={(theme) => ({color: '#fff', zIndex: theme.zIndex.drawer + 1})}
                open={isLoading}
            >
                <CircularProgress disableShrink color="inherit"/>
            </Backdrop>

            <Box sx={{width: '100%'}}>
                <Header
                    type='game'
                    gameId={gameId}
                    gameInfo={gameInfo}
                    handleSetIsUserLeftGame={handleSetIsUserLeftGame}
                />
            </Box>

            {
                (!currentUser.login || !playerColor) && !isLoading && <Box sx={{width: '100%'}}>
                    <Alert
                        severity="info"
                        sx={{m: 1}}
                        variant="outlined"
                        icon={<VisibilityIcon fontSize="inherit"/>}
                    >
                        {T('spectatorMode', currentUser.language)}
                    </Alert>
                </Box>
            }

            <Box sx={{p: 1}} display='flex' justifyContent="start">

                <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
                    {
                        (playerColor === 'white' && chess.turn() === 'b'
                            || playerColor === 'black' && chess.turn() === 'w')
                        && gameInfo.status !== 'finished'
                            ? gameInfo.players?.black
                                ? <FiberManualRecordIcon size={16} color="success" sx={{width: '16px', height: "16px"}}/>
                                : <CircularProgress size={'1em'} color=""/>
                            : gameInfo.players?.black
                                ? <FiberManualRecordIcon size={16} color="success" sx={{width: '16px', height: "16px"}}/>
                                : <FiberManualRecordIcon size={16} color="disabled" sx={{width: '16px', height: "16px"}}/>
                    }
                    <Typography variant="body1" sx={{color: 'rgb(186, 186, 186)', fontWeight: 'bold'}}>
                        {playerColor === 'black'
                            ? gameInfo.players?.white
                                ? gameInfo.players.white
                                : gameInfo.status === 'finished'
                                    ? <>{chess.getHeaders()?.White ? chess.getHeaders()?.White : ''}</>
                                    : <>{T('waitingForOpponent', currentUser.language)}</>
                            : gameInfo.players?.black
                                ? gameInfo.players.black === 'Computer'
                                    ? <>{T('computer', currentUser.language)}</>
                                    : gameInfo.players.black
                                : gameInfo.status === 'finished'
                                    ? <>{chess.getHeaders()?.Black ? chess.getHeaders()?.Black : ''}</>
                                    : <>{T('waitingForOpponent', currentUser.language)}</>
                        }
                    </Typography>
                    {
                        (playerColor === 'white' && chess.turn() === 'b'
                            || playerColor === 'black' && chess.turn() === 'w')
                        && gameInfo.status !== 'finished'
                            ? <Chip label={T('waitingForOpponent', currentUser.language)} size="small"
                                    variant="outlined"/>
                            : gameInfo.status === 'finished'
                                ? (playerColor === 'white' && !gameInfo.players.black) || (playerColor === 'black' && !gameInfo.players.white)
                                    ? <Chip label={T('opponentLeftTheGame', currentUser.language)} size="small"
                                            variant="outlined"/>
                                    : ''
                                : ''
                    }
                </Stack>
            </Box>

            <Box sx={{width: '100%'}}>
                <div
                    ref={boardRef}
                    //style={{width: '400px', height: '400px'}}
                />
            </Box>

            <Box sx={{p: 1}} display='flex' justifyContent="start">
                <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
                    <FiberManualRecordIcon size={16} color="success" sx={{width: '16px', height: "16px"}}/>
                    <Typography variant="body1" sx={{color: 'rgb(186, 186, 186)', fontWeight: 'bold'}}>
                        {playerColor === 'white'
                            ? gameInfo.players.white
                            : playerColor === 'black'
                                ? gameInfo.players?.black
                                : gameInfo.players?.white || ''
                        }
                    </Typography>
                    {
                        playerColor === 'white' && chess.turn() === 'w'
                        || playerColor === 'black' && chess.turn() === 'b'
                            ? <Chip label={T('yourTurn', currentUser.language)} size="small" variant="outlined"/>
                            : ''
                    }
                </Stack>

            </Box>

            <Box sx={{width: '100%', p: 1}}>
                <Paper sx={{width: '100%', overflow: 'hidden', p: 1, textAlign: 'center'}}>
                    {
                        status && !status.gameOver && gameInfo.status !== 'finished'
                            ? status.status
                            : status?.gameOver
                                ? gameInfo.status !== 'finished'
                                    ? status.status
                                    : status.status
                                : gameInfo.status === 'finished' // кто-то сдался, но игра не закончена
                                    ? gameInfo.players.black
                                        ? `${T('whiteLeftTheGame', currentUser.language)}`
                                        : `${T('blackLeftTheGame', currentUser.language)}`
                                    : status?.status
                    }
                </Paper>
            </Box>

            <Box sx={{width: '100%', p: 1}}>
                <MovesList pgn={pgn} fen={chess.fen()}/>
            </Box>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity="info" // success, info, error
                    variant="filled"
                    sx={{width: '100%'}}
                >
                    {
                        gameInfo?.result?.startsWith('black')
                            ? <>{ T('blackWinsGame', currentUser.language) }</>
                            : gameInfo?.result?.startsWith('white')
                                ? <>{ T('whiteWinsGame', currentUser.language) }</>
                                : gameInfo?.result?.startsWith('draw')
                                    ? <>{ T('draw', currentUser.language) }</>
                                    : status?.status
                    }
                </Alert>
            </Snackbar>

        </ThemeProvider>
    );
}

function Page({children}) {
    return (
        <Suspense fallback={<Loading/>}>
            <Game>{children}</Game>
        </Suspense>
    );
}

export default Page;