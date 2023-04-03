import { style } from '@vanilla-extract/css';
import { vars } from '@/theme.css';

export const container = style({
    display: 'inline-flex',
    flexDirection: 'column',
    height: '100vh',
    width: vars.size.sidebar,
    backgroundColor: vars.color.white,
    overflowY: 'auto',
});

export const section = style({
    padding: '2rem',
    borderBottom: vars.border.standard,
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

export const header = style({
    padding: '2rem',
    borderBottom: vars.border.standard,
});

export const subheader = style({
    paddingBottom: '2rem',
});

export const label = style({
    paddingBottom: '1rem',
});

export const body = style({
    selectors: {
        '&:not(:last-child)': {
            paddingBottom: '1rem',
        },
    },
});

export const link = style({
    display: 'block',
    textAlign: 'left',
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

export const active = style({
    opacity: 1,
});
