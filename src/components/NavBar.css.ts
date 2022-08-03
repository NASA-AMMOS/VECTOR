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

export const item = style({
    display: 'inline-flex',
    alignItems: 'center',

    selectors: {
        '&:not(:last-child)': {
            marginRight: '1rem',
        },
    },
});

export const button = style({
    padding: '1rem',
    color: vars.color.black,
    borderRadius: '0.4rem',
    transition: 'opacity 0.1s',

    selectors: {
        '&:hover': {
            opacity: 0.7,
        },
    },
});

export const active = style({
    backgroundColor: vars.color.background,
});

export const small = style({
    fontSize: '0.8rem',
    borderLeft: `0.1rem solid ${vars.color.white}`,
    borderRadius: 0,

    selectors: {
        '&:last-child': {
            borderRadius: '0 0.4rem 0.4rem 0',
        },
    },
});
