import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

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

export const container = style({
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

export const header = style({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `0.1rem solid ${vars.color.background}`,
});

export const title = style({
    fontWeight: 500,
    fontSize: '2.2rem',
});

export const close = style({
    fontSize: '3.6rem',
    transform: 'rotate(45deg)',
    paddingBottom: '0.8rem',
    cursor: 'pointer',
});

export const list = style({
    padding: '1rem 0',
    borderBottom: `0.1rem solid ${vars.color.background}`,
});

export const item = style({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',

    selectors: {
        '&:not(:last-child)': {
            marginBottom: '1rem',
        },
    },
});

export const text = style({
    fontSize: '1.4rem',
});

export const button = style({
    display: 'block',
    padding: '0.6rem 1rem',
    backgroundColor: vars.color.background,
    color: vars.color.black,
    fontSize: '1.2rem',
    borderRadius: '0.4rem',
    transition: 'opacity 0.1s',
    textTransform: 'uppercase',

    selectors: {
        '&:hover': {
            opacity: 0.7,
        },
    },
});

export const large = style({
    width: '100%',
    padding: '1rem',
    marginTop: '1rem',
    fontSize: '1.6rem',
});
