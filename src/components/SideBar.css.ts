import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    display: 'inline-flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
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
    padding: '2rem 2rem 2rem 3rem',
    borderBottom: `0.1rem solid ${vars.color.background}`,
    fontWeight: 500,
    fontSize: '2.5rem',
});

export const subheader = style({
    padding: '0 0 2rem 1rem',
    fontWeight: 500,
    fontSize: '1.8rem',
});

export const item = style({
    display: 'block',
    padding: '0 0 2rem 1rem',

    selectors: {
        '&:last-child': {
            paddingBottom: 0,
        },
    },
});

export const edited = style({
    padding: '0.4rem 1rem',
    border: `0.1rem solid ${vars.color.green}`,
    borderRadius: '2rem',
    fontStyle: 'italic',
    fontWeight: 500,
    textTransform: 'uppercase',
    color: vars.color.green,
});

export const button = style({
    display: 'block',
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

export const middleLevel = style({
    marginLeft: '2rem',
});

export const lastLevel = style({
    marginLeft: '4rem',
});

export const active = style({
    backgroundColor: vars.color.background,
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
