'use client';

import React, {useContext, useEffect, useRef, useState} from "react";
import {
    Table,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    TableFooter,
    Typography,
    Box, Stack, Button
} from "@mui/material";
import {PieChart} from '@mui/x-charts/PieChart';
import {CurrentUserContext} from "@/context/current-user-context";
import T from "@/context/translation";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from '@mui/icons-material/Clear';
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export default function StatsList() {

    const {currentUser, setCurrentUser} = useContext(CurrentUserContext);
    const [selecledRow, setSelectedRow] = useState('total');

    const handleClearStats = () => {
        setCurrentUser({
            ...currentUser,
            stats: {
                ...currentUser.stats,
                chess: {
                    'PvP': {'W': 0, 'D': 0, 'L': 0},
                    'PvE': {'W': 0, 'D': 0, 'L': 0}
                }
            }
        });
    }

    const getStat = (type) => {
        if (type === 'PvP' || type === 'PvE') {
            return {
                GP: currentUser.stats.chess[type].W + currentUser.stats.chess[type].D + currentUser.stats.chess[type].L,
                W: currentUser.stats.chess[type].W,
                D: currentUser.stats.chess[type].D,
                L: currentUser.stats.chess[type].L
            }
        }
        if (type === 'total') {
            return {
                GP: currentUser.stats.chess.PvP.W + currentUser.stats.chess.PvP.D + currentUser.stats.chess.PvP.L + currentUser.stats.chess.PvE.W + currentUser.stats.chess.PvE.D + currentUser.stats.chess.PvE.L,
                W: currentUser.stats.chess.PvP.W + currentUser.stats.chess.PvE.W,
                D: currentUser.stats.chess.PvP.D + currentUser.stats.chess.PvE.D,
                L: currentUser.stats.chess.PvP.L + currentUser.stats.chess.PvE.L
            }
        }
        return {
            GP: 0,
            W: 0,
            D: 0,
            L: 0
        }
    }

    return (
        <Box sx={{width: "100%"}}>
            <Box sx={{p: 2}}>
                <Typography variant="h5">
                    {T('stats', currentUser.language)}
                </Typography>
            </Box>

            {
                currentUser.stats && <Paper>
                    <TableContainer>
                        <Table size="small" aria-label="a dense table">
                            <TableBody>
                                <TableRow
                                    sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                >
                                    <TableCell align="left" sx={{width: '32%'}}> </TableCell>
                                    <TableCell align="center"
                                               sx={{width: '17%'}}>{T('gamesPlayed', currentUser.language)}</TableCell>
                                    <TableCell align="center"
                                               sx={{width: '17%'}}>{T('wins', currentUser.language)}</TableCell>
                                    <TableCell align="center"
                                               sx={{width: '17%'}}>{T('draws', currentUser.language)}</TableCell>
                                    <TableCell align="center"
                                               sx={{width: '17%'}}>{T('losses', currentUser.language)}</TableCell>
                                </TableRow>
                                <TableRow
                                    sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                    selected={selecledRow === 'PvP'}
                                    onClick={() => setSelectedRow('PvP')}
                                >
                                    <TableCell align="left"
                                               sx={{width: '32%'}}>{T('vsPlayers', currentUser.language)}</TableCell>
                                    <TableCell align="center" sx={{width: '17%'}}>{getStat('PvP').GP}</TableCell>
                                    <TableCell align="center" sx={{width: '17%'}}>{getStat('PvP').W}</TableCell>
                                    <TableCell align="center" sx={{width: '17%'}}>{getStat('PvP').D}</TableCell>
                                    <TableCell align="center" sx={{width: '17%'}}>{getStat('PvP').L}</TableCell>
                                </TableRow>
                                <TableRow
                                    sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                    selected={selecledRow === 'PvE'}
                                    onClick={() => setSelectedRow('PvE')}
                                >
                                    <TableCell align="left"
                                               sx={{width: '32%'}}>{T('vsComputer', currentUser.language)}</TableCell>
                                    <TableCell align="center" sx={{width: '17%'}}>{getStat('PvE').GP}</TableCell>
                                    <TableCell align="center" sx={{width: '17%'}}>{getStat('PvE').W}</TableCell>
                                    <TableCell align="center" sx={{width: '17%'}}>{getStat('PvE').D}</TableCell>
                                    <TableCell align="center" sx={{width: '17%'}}>{getStat('PvE').L}</TableCell>
                                </TableRow>
                                <TableRow
                                    sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                    selected={selecledRow === 'total'}
                                    onClick={() => setSelectedRow('total')}
                                >
                                    <TableCell align="left" sx={{width: '32%'}}>
                                        <b>{T('total', currentUser.language)}</b>
                                    </TableCell>
                                    <TableCell align="center" sx={{width: '17%'}}><b>{getStat('total').GP}</b></TableCell>
                                    <TableCell align="center" sx={{width: '17%'}}><b>{getStat('total').W}</b></TableCell>
                                    <TableCell align="center" sx={{width: '17%'}}><b>{getStat('total').D}</b></TableCell>
                                    <TableCell align="center" sx={{width: '17%'}}><b>{getStat('total').L}</b></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            }
            {
                getStat('total').GP !== 0 && <Box sx={{p: 2, pt: 3}}>
                    <Typography variant="body1" gutterBottom sx={{textAlign: 'center'}}>
                        {
                            selecledRow === 'PvE'
                                ? T('vsComputer', currentUser.language)
                                : selecledRow === 'PvP'
                                    ? T('vsPlayers', currentUser.language)
                                    : T('total', currentUser.language)
                        }
                    </Typography>
                    <PieChart
                        series={[
                            {
                                arcLabel: (item) => `${item.value} (${item.percentage.toFixed(0)}%)`,
                                arcLabelMinAngle: 35,
                                arcLabelRadius: '60%',
                                data: [
                                    {
                                        id: 0,
                                        value: getStat(selecledRow).W,
                                        percentage: getStat(selecledRow).W / getStat(selecledRow).GP * 100,
                                        label: T('winsDescription', currentUser.language)
                                    },
                                    {
                                        id: 1,
                                        value: getStat(selecledRow).D,
                                        percentage: getStat(selecledRow).D / getStat(selecledRow).GP * 100,
                                        label: T('drawsDescription', currentUser.language)
                                    },
                                    {
                                        id: 2,
                                        value: getStat(selecledRow).L,
                                        percentage: getStat(selecledRow).L / getStat(selecledRow).GP * 100,
                                        label: T('lossesDescription', currentUser.language)
                                    },
                                ],
                                cornerRadius: 6,
                                innerRadius: 10,
                                outerRadius: 90,
                            },
                        ]}
                        width={200}
                        height={200}
                    />
                </Box>
            }

            <Stack sx={{p: 2, color: '#bababa', fontSize: 'small'}} spacing={1}>
                <Box><b>{T('gamesPlayed', currentUser.language)}</b>: {T('gamesPlayedDescription', currentUser.language)}
                </Box>
                <Box><b>{T('wins', currentUser.language)}</b>: {T('winsDescription', currentUser.language)}</Box>
                <Box><b>{T('draws', currentUser.language)}</b>: {T('drawsDescription', currentUser.language)}</Box>
                <Box><b>{T('losses', currentUser.language)}</b>: {T('lossesDescription', currentUser.language)}</Box>
            </Stack>

            {

                getStat('total').GP !== 0 && <Stack spacing={2} sx={{mt: 2, mb: 5}}>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleClearStats}
                        startIcon={<ClearIcon/>}
                    >
                        {T('clearStats', currentUser.language)}
                    </Button>
                </Stack>
            }
        </Box>
    );
}