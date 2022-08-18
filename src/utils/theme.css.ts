import { createGlobalTheme } from '@vanilla-extract/css';

export const theme = {
    color: {
        white: '#FFFFFF',
        black: '#2D3436',
        gray: 'rgb(91, 79, 80)',
        offWhite: 'rgba(161, 113, 147, 0.1)',
        background: 'rgb(236, 231, 236)',
        initial: 'rgba(104, 40, 40, 0.5)',
        initialHex: 'rgb(104, 40, 40)',
        final: 'rgba(237, 28, 46, 0.5)',
        finalHex: 'rgb(237, 28, 46)',
        increase: 'rgb(100, 100, 100)',
        decrease: 'rgb(139, 140, 139)',
    },
    size: {
        sidebar: '15vw',
    },
};

export const vars = createGlobalTheme(':root', theme);
