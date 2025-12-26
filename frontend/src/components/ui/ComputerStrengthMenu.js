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
import MemoryIcon from "@mui/icons-material/Memory";

const options = [
    [0, 'veryEasy'],
    [1, 'easy'],
    [2, 'medium'],
    [3, 'hard'],
    [4, 'veryHard'],
];

export default function ComputerStrengthMenu() {

    const {currentUser, setCurrentUser} = useContext(CurrentUserContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const open = Boolean(anchorEl);

    useEffect(() => {
        let cu = currentUser;
        if (cu.computerStrength && cu.computerStrength !== options[selectedIndex][0]) {
            let newIndex = options.filter(o => o[0] === cu.computerStrength)[0][0];
            if (newIndex) {
                setSelectedIndex(newIndex);
            }
        }
    }, [currentUser.computerStrength]);

    const handleClickListItem = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuItemClick = (event, index) => {
        setSelectedIndex(index);
        setAnchorEl(null);

        let cu = currentUser;
        if (cu.computerStrength !== options[index][0]) {
            cu.computerStrength = options[index][0];
            setCurrentUser(prevState => {
                return {...prevState, computerStrength: cu.computerStrength}
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
                    <MemoryIcon/>
                </ListItemIcon>
                <ListItemText
                    primary={ T('computerStrength', currentUser.language) }
                    secondary={ T(options[selectedIndex][1], currentUser.language) }
                />
            </MenuItem>
            <Menu
                id="comp-strength-menu"
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
                        selected={option[0] === currentUser.computerStrength}
                        onClick={(event) => handleMenuItemClick(event, index)}
                    >
                        {
                            option[0] === currentUser.computerStrength
                                ? <><ListItemIcon><CheckIcon/></ListItemIcon> {T(option[1], currentUser.language)}</>
                                : <ListItemText inset>{T(option[1], currentUser.language)}</ListItemText>

                        }

                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}