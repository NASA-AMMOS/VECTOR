import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    display: 'grid',
    gridTemplateRows: 'repeat(3, 1fr)',
    gridTemplateColumns: 'repeat(2, 1fr)',
    height: '100vh',
    padding: '4rem',
    backgroundColor: vars.color.background,
});

export const zone = style({
    gridRow: '2 / 3',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: vars.color.white,
    borderRadius: '0.4rem',
    cursor: 'pointer',
});

export const header = style({
    gridColumn: '2 / 3',
    gridRow: '2 / 3',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
});

export const title = style({
    fontSize: '8rem',
});

export const body = style({
    width: '27rem',
    textAlign: 'justify',

    selectors: {
        '&::after': {
            content: '""',
            display: 'inline-block',
            width: '100%',
        },
    },
});
