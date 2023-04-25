import { style } from '@vanilla-extract/css';
import { vars } from '@/theme.css';

export const container = style({
    display: 'grid',
    gridTemplateRows: 'repeat(3, 1fr)',
    gridTemplateColumns: 'repeat(2, 1fr)',
    height: '100vh',
    padding: '4rem',
    backgroundColor: vars.color.background,
});

export const content = style({
    gridRow: '2 / 3',
    display: 'flex',
    flexDirection: 'column',
});

export const zone = style({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: vars.color.white,
    borderRadius: vars.border.radius,
    cursor: 'pointer',
});

export const details = style({
    padding: '1rem 0rem',
    display: 'flex',
    justifyContent: 'space-between',
});

export const indicators = style({
    display: 'flex',
});

export const indicator = style({
    selectors: {
        '&:not(:last-child)': {
            paddingRight: '1rem',
        },
    },
});

export const button = style({
    backgroundColor: vars.color.gray,
    color: vars.color.white,
    borderRadius: vars.border.radius,
    padding: '1rem',

    selectors: {
        '&:disabled': {
            opacity: 0.25,
            cursor: 'not-allowed',
        },
    },
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
    fontSize: '9rem',
});

export const body = style({
    width: '36rem',
    textAlign: 'justify',

    selectors: {
        '&::after': {
            content: '""',
            display: 'inline-block',
            width: '100%',
        },
    },
});
