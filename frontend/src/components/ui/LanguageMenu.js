'use client';

import React, {useContext, useState, useEffect} from "react";
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import LanguageIcon from "@mui/icons-material/Language";
import {ListItem, ListItemIcon} from "@mui/material";
import T from "@/context/translation";
import CheckIcon from "@mui/icons-material/Check";
import TranslateIcon from '@mui/icons-material/Translate';
import {CurrentUserContext} from "@/context/current-user-context";

const options = [
    [0, 'ru', 'Русский'],
    [1, 'en', 'English'],
    [2, 'zh', '简体中文'],
];

export default function LanguageMenu() {

    const {currentUser, setCurrentUser} = useContext(CurrentUserContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const open = Boolean(anchorEl);

    useEffect(() => {
        let cu = currentUser;
        if (cu.language && cu.language !== options[selectedIndex][1]) {
            let newIndex = options.filter(o => o[1] === cu.language)[0][0];
            if (newIndex) {
                setSelectedIndex(newIndex);
            }
        }
    }, [currentUser.language]);

    const handleClickListItem = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuItemClick = (event, index) => {
        setSelectedIndex(index);
        setAnchorEl(null);

        let cu = currentUser;
        if (cu.language !== options[index][1]) {
            cu.language = options[index][1];
            setCurrentUser(prevState => {
                return {...prevState, language: cu.language}
            });
            localStorage.setItem('ws-current-user', JSON.stringify(cu));
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <MenuItem
                onClick={handleClickListItem}
                //component="nav"
                //aria-label="Device settings"
                //sx={{bgcolor: 'background.paper'}}
                sx={{mt: 1}}
            >
                <ListItemIcon>
                    <TranslateIcon/>
                </ListItemIcon>
                <ListItemText
                    primary={ T('language', currentUser.language) }
                    secondary={ options[selectedIndex][2] }
                />
            </MenuItem>
            <Menu
                id="lock-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                    list: {
                        'aria-labelledby': 'lock-button',
                        role: 'listbox',
                    },
                }}
            >
                {options.map((option, index) => (
                    <MenuItem
                        key={option[1]}
                        //disabled={index === 0}
                        selected={option[1] === currentUser.language}
                        onClick={(event) => handleMenuItemClick(event, index)}
                    >
                        {
                            option[1] === currentUser.language
                                ? <><ListItemIcon><CheckIcon/></ListItemIcon> {option[2]}</>
                                : <ListItemText inset>{option[2]}</ListItemText>

                        }

                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}