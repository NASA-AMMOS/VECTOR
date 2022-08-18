import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    display: 'inline-flex',
    flexDirection: 'column',
    height: '100vh',
    width: vars.size.sidebar,
    fontSize: '1.6rem',
    backgroundColor: vars.color.white,
    borderRight: `0.1rem solid ${vars.color.background}`,
    overflowY: 'auto',
});

export const section = style({
    padding: '2rem',
    borderBottom: `0.1rem solid ${vars.color.background}`,
});

export const header = style({
    padding: '2rem',
    borderBottom: `0.1rem solid ${vars.color.background}`,
    fontWeight: 500,
    fontSize: '2.5rem',
});

export const subheader = style({
    paddingBottom: '2rem',
    fontWeight: 500,
    fontSize: '1.8rem',
});

export const item = style({
    display: 'block',
    paddingBottom: '2rem',

    selectors: {
        '&:last-child': {
            paddingBottom: 0,
        },
    },
});

export const button = style({
    display: 'block',
    padding: '1rem',
    backgroundColor: vars.color.background,
    color: vars.color.black,
    borderRadius: '0.4rem',
    transition: 'opacity 0.1s',

    selectors: {
        '&:hover': {
            opacity: 0.7,
        },
    },
});

export const link = style({
    display: 'block',
    color: vars.color.black,
    opacity: 0.3,
    transition: 'opacity 0.1s',

    selectors: {
        '&:hover': {
            opacity: 1,
        },
        '&:not(:last-child)': {
            marginBottom: '2rem',
        },
    },
});

export const middleLevel = style({
    marginLeft: '2rem',
});

export const lastLevel = style({
    marginLeft: '4rem',
});

export const text = style({
    fontSize: '1.2rem',

    selectors: {
        '&:not(:last-child)': {
            paddingBottom: '1rem',
        },
    },
});

export const active = style({
    opacity: 1,
});

export const small = style({
    fontSize: '1.2rem',
});
