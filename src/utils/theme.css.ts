import { createGlobalTheme } from '@vanilla-extract/css';

export const theme = {
    color: {
        white: '#FFFFFF',
        black: '#2D3436',
        gray: '#6F6F78',
        green: '#2ECC71',
        offWhite: 'rgba(161, 113, 147, 0.1)',
        background: 'rgb(236, 231, 236)',
        initial: 'rgba(157, 201, 222, 0.5)',
        initialHex: 'rgb(157, 201, 222)',
        final: 'rgba(58, 153, 90, 0.5)',
        finalHex: 'rgb(58, 153, 90)',
        increase: 'rgba(255, 194, 14, 1)',
        decrease: 'rgb(52, 94, 145)',
    },
    size: {
        sidebar: '15vw',
        toolbar: '7vh',
    },
};

export const vars = createGlobalTheme(':root', theme);
