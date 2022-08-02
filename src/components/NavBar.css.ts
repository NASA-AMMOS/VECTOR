import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '8vh',
    padding: '2rem',
    fontSize: '1.5rem',
    backgroundColor: vars.color.white,
});

export const header = style({
    fontWeight: 500,
});

export const button = style({
    padding: '1rem',
    color: vars.color.black,
    borderRadius: '0.4rem',
    transition: 'all 0.1s',

    selectors: {
        '&:not(:last-of-type)': {
            marginRight: '1rem',
        },
        '&:hover': {
            opacity: 0.7,
        },
    },
});

export const active = style({
    backgroundColor: vars.color.background,
});
