import { createGlobalTheme } from '@vanilla-extract/css';

export const theme = {
    color: {
        white: '#FFFFFF',
        black: '#2D3436',
        gray: '#6F6F78',
        offWhite: 'rgba(161, 113, 147, 0.1)',
        background: 'rgb(236, 231, 236)',
        initial: 'rgba(161, 113, 147, 0.48)',
        initialHex: '#A17193',
        initialOpacity: '0.48',
        final: 'rgba(203, 33, 40, 0.48)',
        finalHex: '#CB2128',
        finalOpacity: '0.48',
        increase: 'rgba(255, 194, 14, 1)',
        decrease: 'rgb(52, 94, 145)',
    },
    size: {
        toolbar: '7vh',
    },
};

export const vars = createGlobalTheme(':root', theme);
