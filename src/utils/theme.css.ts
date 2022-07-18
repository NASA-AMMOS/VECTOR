import { createGlobalTheme } from '@vanilla-extract/css';

export const vars = createGlobalTheme(':root', {
    color: {
        white: '#fff',
        black: '#000',
        offBlack: '#2d3436',
        gray: '#bdc3c7',
        red: '#e74c3c',
        lightRed: '#ff7979',
    },
});
