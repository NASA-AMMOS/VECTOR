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

export const shadow = style({
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: vars.color.black,
    opacity: 0.5,
    zIndex: 1,
});

export const modal = style({
    position: 'fixed',
    top: '50%',
    left: '50%',
    width: '40rem',
    transform: 'translate(-50%, -50%)',
    padding: '1rem 1.5rem 2rem',
    backgroundColor: vars.color.white,
    borderRadius: '0.4rem',
    zIndex: 2,
});

export const top = style({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
});

export const close = style({
    fontSize: '3rem',
    transform: 'rotate(45deg)',
    paddingBottom: '0.5rem',
    cursor: 'pointer',
});

export const edits = style({
    paddingTop: '1rem',
});

export const edit = style({
    selectors: {
        '&:not(:last-child)': {
            marginBottom: '1rem',
        },
    }
})
