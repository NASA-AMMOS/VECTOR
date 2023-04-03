import { style } from '@vanilla-extract/css';

export const container = style({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
});

export const svg = style({
    maxWidth: '100%',
    maxHeight: '100%',
    height: 'auto',
    width: '100%',
});
