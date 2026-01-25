'use client';
import {useRouter, useSearchParams} from 'next/navigation';
import {ThemeProvider, createTheme, useColorScheme} from '@mui/material/styles';
import React, {useRef, useEffect, useState, useContext, useCallback, Suspense} from 'react';
import {Alert, Backdrop, Box, Button, Chip, CircularProgress, Paper, Stack, Typography} from "@mui/material";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import VisibilityIcon from '@mui/icons-material/Visibility';
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

function Stats() {
    const router = useRouter();
    const {currentUser, setCurrentUser} = useContext(CurrentUserContext);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            setIsLoading(false);
        } else {
            setIsLoading(true);
        }
    }, [currentUser]);

    if (!currentUser.stats) {
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
                sx={(theme) => ({color: '#fff', zIndex: theme.zIndex.drawer + 1})}
                open={isLoading}
            >
                <CircularProgress disableShrink color="inherit"/>
            </Backdrop>

            <Box sx={{width: '100%'}}>
                <Header type='stats'/>
            </Box>

            <Box sx={{width: '100%', p: 1}}>
                <StatsList/>
            </Box>
        </ThemeProvider>
    );
}

function Page({children}) {
    return (
        <Suspense fallback={<Loading/>}>
            <Stats>{children}</Stats>
        </Suspense>
    );
}

export default Page;