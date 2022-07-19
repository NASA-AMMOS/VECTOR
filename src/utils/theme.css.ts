import { createGlobalTheme } from '@vanilla-extract/css';

export const vars = createGlobalTheme(':root', {
    color: {
        white: '#fff',
        lightWhite: 'rgba(255, 255, 255, 0.7)',
        darkWhite: 'rgba(255, 232, 205, 0.78)',
        black: '#000',
        offBlack: '#2d3436',
        gray: '#bdc3c7',
        red: '#e74c3c',
        lightRed: '#ff7979',
        yellow: 'rgba(255, 194, 14, 1)',
        lightBlue: 'rgba(0, 158, 226, 0.63)',
        darkBlue: 'rgba(0, 85, 147, 0.63)',
    },
});
