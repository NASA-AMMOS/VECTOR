import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    position: 'relative',
    gridColumn: '1 / -1',
    height: '100%',
    border: `0.4rem solid ${vars.color.background}`,
    borderRadius: '0.4rem',
});

export const canvas = style({
    height: '100%',
    width: '100%',
});

export const tooltip = style({
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    padding: '1rem',
    backgroundColor: vars.color.background,
    borderRadius: '0.4rem',
    zIndex: 1,
});

export const item = style({
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',

    selectors: {
        '&:not(:last-of-type)': {
            marginBottom: '1rem',
        },
    },
});

export const input = style({
    backgroundColor: vars.color.white,
    width: '100%',
    padding: '1rem',
    fontSize: '1.4rem',
    borderRadius: '0.4rem',
})

export const checkbox = style({
    appearance: 'none',
    height: '1.4rem',
    width: '1.4rem',
    marginRight: '1rem',
    transition: 'all 0.3s',
    backgroundColor: vars.color.white,
    borderRadius: '50%',
    border: `0.1rem solid ${vars.color.black}`,
    cursor: 'pointer',

    selectors: {
        '&::before': {
            content: '""',
            display: 'inline-block',
            height: 'inherit',
            width: 'inherit',
            backgroundColor: 'transparent',
            borderRadius: '50%',
        },
        '&:checked': {
            backgroundColor: vars.color.black,
        },
    },
});

export const label = style({
    fontSize: '1.4rem',
    cursor: 'pointer',
});
