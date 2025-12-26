'use client';
import {
    Box,
    CircularProgress, Backdrop
} from "@mui/material";

import React from "react";
import {createTheme, ThemeProvider} from "@mui/material/styles";

const theme = createTheme({
    colorSchemes: {
        dark: true,
    },
});

export default function Loading() {
    return (
        <ThemeProvider theme={theme} defaultMode="dark" noSsr>
            <Backdrop
                sx={(theme) => ({color: '#fff', zIndex: theme.zIndex.drawer + 2})}
                open={true}
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
        </ThemeProvider>
    );
}