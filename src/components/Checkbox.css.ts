import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.2rem',

    selectors: {
        '&:not(:last-of-type)': {
            marginRight: '1.6rem',
        },
    },
});

export const input = style({
    appearance: 'none',
    height: '1.4rem',
    width: '1.4rem',
    marginRight: '0.4rem',
    transition: 'all 0.3s',
    backgroundColor: vars.color.white,
    borderRadius: '0.2rem',
    border: `0.1rem solid ${vars.color.initialHex}`,
    cursor: 'pointer',

    selectors: {
        '&::before': {
            content: '""',
            display: 'inline-block',
            height: 'inherit',
            width: 'inherit',
            backgroundColor: 'transparent',
            borderRadius: '0.2rem',
        },
        '&:checked': {
            backgroundColor: vars.color.initialHex,
        },
    },
});

export const label = style({
    cursor: 'pointer',
});
