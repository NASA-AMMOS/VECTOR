import { createGlobalTheme } from '@vanilla-extract/css';

export const vars = createGlobalTheme(':root', {
    color: {
        white: '#FFFFFF',
        black: '#2D3436',
        background: 'rgb(235, 247, 253)',
        initial: 'rgba(0, 85, 147, 0.63)',
        final: 'rgba(0, 158, 226, 0.63)',
        increase: 'rgba(255, 194, 14, 1)',
    },
});
