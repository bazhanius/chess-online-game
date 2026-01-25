'use client';

import React, {useContext, useState} from 'react';
import {Button} from '@mui/material';
import {CurrentUserContext} from '@/context/current-user-context';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import T from "@/context/translation";

function CopyButton({textToCopy}) {

    const {currentUser, setCurrentUser} = useContext(CurrentUserContext);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
        } catch (err) {
            console.error('Failed to copy text: ', err);
            // Optionally, handle error, e.g., show an error message
        }
    };

    return (
        <Button
            variant="contained"
            color="primary"
            onClick={handleCopy}
            startIcon={copied ? <CheckIcon/> : <ContentCopyIcon/>}
        >
            {
                copied
                    ? <>{T('Xcopied', currentUser.language, 'PGN')}</>
                    : <>{T('copyX', currentUser.language, 'PGN')}</>
            }
        </Button>

    );
}

export default CopyButton;
