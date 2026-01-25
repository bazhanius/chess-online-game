'use client';
import {useRouter, useSearchParams} from 'next/navigation';
import {ThemeProvider, createTheme, useColorScheme} from '@mui/material/styles';
import React, {useRef, useEffect, useState, useContext, useCallback, Suspense} from 'react';
import {
    Alert,
    Backdrop,
    Box,
    Button,
    Chip,
    CircularProgress,
    Paper,
    Stack,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon, Accordion, AccordionDetails, AccordionSummary, Link
} from "@mui/material";

import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {CurrentUserContext} from "@/context/current-user-context";
import Header from "@/components/ui/Header";
import T from "@/context/translation";
import D from "@/context/stockfish-difficulty";
import Loading from "@/components/ui/Loading";
import StatsList from "@/components/ui/StatsList";

const theme = createTheme({
    colorSchemes: {
        dark: true,
    },
});

function About() {
    const router = useRouter();
    const {currentUser, setCurrentUser} = useContext(CurrentUserContext);
    const [isLoading, setIsLoading] = useState(true);

    const [expanded, setExpanded] = React.useState(false);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };


    useEffect(() => {
        if (currentUser) {
            setIsLoading(false);
        } else {
            setIsLoading(true);
        }
    }, [currentUser]);

    return (
        <ThemeProvider theme={theme} defaultMode="dark" noSsr>
            <Backdrop
                sx={(theme) => ({color: '#fff', zIndex: theme.zIndex.drawer + 1})}
                open={isLoading}
            >
                <CircularProgress disableShrink color="inherit"/>
            </Backdrop>

            <Box sx={{width: '100%'}}>
                <Header type='about'/>
            </Box>

            <Box sx={{width: '100%', p: 1}}>
                <Box sx={{p: 2}}>
                    <Stack spacing={1}>
                        <Typography variant="h5">
                            {T('aboutGame', currentUser.language)}
                        </Typography>
                        <Typography variant="body1">
                            Играйте в шахматы против компьютера или игроков в локальной сети.
                        </Typography>
                        <Typography variant="body1">
                            В игре применяются стандартные правила.
                            Ничья засчитывается в ситуациях:
                        </Typography>
                        <List
                            dense={true}
                            sx={{
                                listStyleType: 'disc',
                                pl: 3,
                                '& .MuiListItem-root': {
                                    display: 'list-item',
                                    pl: 1
                                },
                            }}>
                            <ListItem>пат</ListItem>
                            <ListItem>недостаточность материала для мата</ListItem>
                            <ListItem>невозможность поставить мат</ListItem>
                            <ListItem>троекратное повторение одной и той же позиции</ListItem>
                            <ListItem>правило 50 ходов</ListItem>
                        </List>
                        <Typography variant="body1">
                            Победа:
                        </Typography>
                        <List
                            dense={true}
                            sx={{
                                listStyleType: 'disc',
                                pl: 3,
                                '& .MuiListItem-root': {
                                    display: 'list-item',
                                    pl: 1
                                },
                            }}>
                            <ListItem>поставлен мат</ListItem>
                            <ListItem>соперник сдался</ListItem>
                        </List>
                    </Stack>
                </Box>
                <Box sx={{p: 2}}>
                    <Typography variant="h5" sx={{pb: 2}}>
                        {T('openSourceLicenses', currentUser.language)}
                    </Typography>
                    <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon/>}
                            aria-controls="panel1bh-content"
                            id="panel1bh-header"
                        >
                            <Typography component="span" sx={{width: '40%', flexShrink: 0}}>
                                chessground
                            </Typography>
                            <Typography component="span" sx={{color: 'text.secondary'}}>
                                GPL-3.0 license
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Link href="https://github.com/lichess-org/chessground/" underline="always">
                                https://github.com/lichess-org/chessground/
                            </Link>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon/>}
                            aria-controls="panel3bh-content"
                            id="panel3bh-header"
                        >
                            <Typography component="span" sx={{width: '40%', flexShrink: 0}}>
                                stockfish.js
                            </Typography>
                            <Typography component="span" sx={{color: 'text.secondary'}}>
                                GPL-3.0 license
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Paper sx={{maxHeight: '120px', overflowY: 'scroll'}}>
                                <Stack spacing={1}>
                                    <Link href="https://github.com/lichess-org/stockfish.js" underline="always">
                                        https://github.com/lichess-org/stockfish.js
                                    </Link>
                                    <pre style={{whiteSpace: 'pre-wrap', fontFamily: 'monospace'}}>
                                    <code>

                                    </code></pre>
                                </Stack>
                            </Paper>

                        </AccordionDetails>
                    </Accordion>

                    <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon/>}
                            aria-controls="panel2bh-content"
                            id="panel2bh-header"
                        >
                            <Typography component="span" sx={{width: '40%', flexShrink: 0}}>
                                chess.js
                            </Typography>
                            <Typography component="span" sx={{color: 'text.secondary'}}>
                                BSD-2-Clause license
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Paper sx={{maxHeight: '120px', overflowY: 'scroll'}}>
                                <Stack spacing={1}>
                                    <Link href="https://github.com/jhlywa/chess.js" underline="always">
                                        https://github.com/jhlywa/chess.js
                                    </Link>

                                    <pre style={{
                                        whiteSpace: 'pre-wrap',
                                        fontFamily: 'monospace',
                                        backgroundColor: '#000'
                                    }}>
                                    <code>
                                    Copyright (c) 2025, Jeff Hlywa (jhlywa@gmail.com)<br/><br/>
All rights reserved.<br/><br/>

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:<br/><br/>

1. Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.<br/><br/>
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.<br/><br/>

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
                                </code></pre>
                                </Stack>
                            </Paper>

                        </AccordionDetails>
                    </Accordion>

                </Box>
                <Box sx={{p: 2}}>
                    <Typography>
                        © 2026 <Link href="https://github.com/bazhanius" underline="always">
                        Alexander Bazhanov
                    </Link>
                    </Typography>
                    <Typography component="code">Версия: 1.0.20260123</Typography>
                </Box>
            </Box>
        </ThemeProvider>
    );
}

function Page({children}) {
    return (
        <Suspense fallback={<Loading/>}>
            <About>{children}</About>
        </Suspense>
    );
}

export default Page;