'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    toggleTheme: () => { },
});

export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark'); // Defaulting to dark as requested

    useEffect(() => {
        const stored = localStorage.getItem('luncho-theme') as Theme | null;
        if (stored) {
            setTheme(stored);
            document.documentElement.classList.toggle('dark', stored === 'dark');
        } else {
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        const next = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
        localStorage.setItem('luncho-theme', next);
        document.documentElement.classList.toggle('dark', next === 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}