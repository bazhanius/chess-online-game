'use client';

import React, {useContext, useEffect, useRef, useState} from "react";
import {
    Table,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    Stack,
    TableHead, Typography
} from "@mui/material";
import CopyButton from "@/components/ui/CopyButton";
import T from "@/context/translation";
import {CurrentUserContext} from '@/context/current-user-context';

export default function MovesList({pgn, fen}) {

    const {currentUser, setCurrentUser} = useContext(CurrentUserContext);
    const [prevPgn, setPrevPgn] = useState('');
    const [pgnArray, setPgnArray] = useState([]);
    const [fenString, setFenString] = useState('');
    const [score, setScore] = useState(0);
    const scrollRef = useRef(null);

    const oppositeColor = (color) => (color === 'white' ? 'black' : 'white');
    const charToRole = (char) => {
        switch (char.toLowerCase()) {
            case 'p':
                return 'pawn';
            case 'n':
                return 'knight';
            case 'b':
                return 'bishop';
            case 'r':
                return 'rook';
            case 'q':
                return 'queen';
            case 'k':
                return 'king';
            default:
                return;
        }
    }

    const getMaterialDiff = (fenString) => {
        const diff = {
            white: {king: 0, queen: 0, rook: 0, bishop: 0, knight: 0, pawn: 0},
            black: {king: 0, queen: 0, rook: 0, bishop: 0, knight: 0, pawn: 0},
        };
        for (let i = 0, part = 0; i < fenString.length && part < 8; i++) {
            const ch = fenString[i];
            const lower = ch.toLowerCase();
            const role = charToRole(ch);
            if (role) {
                const color = ch === lower ? 'black' : 'white';
                const them = diff[oppositeColor(color)];
                if (them[role] > 0) them[role]--;
                else diff[color][role]++;
            } else if (ch === '[' || ch === ' ') break;
            else if (ch === '/') part++;
        }
        return diff;
    }

    const getScore = () => {
        const diff = getMaterialDiff(fenString);
        setScore(
            (
                (diff.white.queen - diff.black.queen) * 9 +
                (diff.white.rook - diff.black.rook) * 5 +
                (diff.white.bishop - diff.black.bishop) * 3 +
                (diff.white.knight - diff.black.knight) * 3 +
                (diff.white.pawn - diff.black.pawn)
            )
        );
    }

    useEffect(() => {
        if (pgn !== prevPgn) {
            setPrevPgn(pgn);

            let moves = pgn.split(/\r?\n/).slice(-1)[0].split(' ').slice(0, -1);
            let newPgn = [];
            for (let i = 1; i < moves.length; i += 3) {
                newPgn.push({
                    n: moves[i - 1].split('.')[0],
                    w: moves[i],
                    b: moves[i + 1] ? moves[i + 1] : ""
                })
            }
            setPgnArray(newPgn);
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }
    }, [pgn]);

    useEffect(() => {
        if (typeof fen === 'string' && fen.length > 0) {
            let newFen = fen.split(' ')[0];
            if (newFen !== fenString) {
                setFenString(newFen);
            }
        }
    }, [fen])

    useEffect(() => {
        getScore();
    }, [fenString])

    return (
        <>
            {
                pgnArray.length > 0 && <Paper sx={{width: '100%', overflow: 'hidden'}}>
                    <TableContainer
                        sx={{maxHeight: 130, overflowY: 'auto'}}
                        ref={scrollRef}
                    >
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center" sx={{width: '20%'}}>
                                        {T('move', currentUser.language)}
                                    </TableCell>
                                    <TableCell align="center" sx={{width: '40%'}}>
                                        {T('white', currentUser.language)}
                                        <Typography variant="span" color="#bababa" sx={{pl: 1, fontSize: '0.8em'}}>
                                            {score > 0 ? '+' + score : ''}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center" sx={{width: '40%'}}>
                                        {T('black', currentUser.language)}
                                        <Typography variant="span" color="#bababa" sx={{pl: 1, fontSize: '0.8em'}}>
                                            {score < 0 ? '+' + -score : ''}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pgnArray.map((row) => (
                                    <TableRow
                                        key={row.n}
                                        sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                    >
                                        <TableCell align="center" sx={{width: '20%'}}>{row.n}</TableCell>
                                        <TableCell align="center" sx={{width: '40%'}}>{row.w}</TableCell>
                                        <TableCell align="center" sx={{width: '40%'}}>{row.b}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            }
            {
                pgnArray.length > 0 && <Stack spacing={2} sx={{mt: 2, mb: 5}}>
                    <CopyButton textToCopy={prevPgn}/>
                </Stack>
            }
        </>
    );
}