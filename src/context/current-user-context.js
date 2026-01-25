'use client';

import {useState, createContext, useEffect} from 'react';

export const CurrentUserContext = createContext(null);

export default function CurrentUserProvider(props) {

    const localStorageUser = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('bazhanius-lan-games'))
        : null;
    const languageFromNavigator = navigator.language.indexOf('ru') !== -1 ? 'ru' : 'en';
    const emptyStats = {
        'PvP': {'W': 0, 'D': 0, 'L': 0},
        'PvE': {'W': 0, 'D': 0, 'L': 0}
    };

    const [currentUser, setCurrentUser] = useState({
        login: localStorageUser ? localStorageUser.login : null,
        token: localStorageUser ? localStorageUser.token : null,
        language: localStorageUser ? localStorageUser.language : null,
        computerStrength: localStorageUser ? localStorageUser.computerStrength : 0,
        stats: localStorageUser ? localStorageUser.stats : {
            chess: emptyStats,
            battleship: emptyStats,
        },
    });

    useEffect(() => {
        if (currentUser.language === null) {
            setCurrentUser(prevState => {
                return {...prevState, language: languageFromNavigator}
            });
        }
        if (currentUser.stats === null) {
            setCurrentUser(prevState => {
                return {
                    ...prevState,
                    stats: {
                        chess: emptyStats,
                        battleship: emptyStats,
                    }
                }
            });
        }
    }, [currentUser, setCurrentUser]);

    return (
        <CurrentUserContext.Provider
            value={{
                currentUser,
                setCurrentUser
            }}
        >
            {props.children}
        </CurrentUserContext.Provider>
    );

}