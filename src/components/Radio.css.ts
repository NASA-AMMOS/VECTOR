import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    display: 'flex',
    alignItems: 'center',
    height: '2rem',
    fontSize: '1.2rem',

    selectors: {
        '&:not(:last-of-type)': {
            marginBottom: '1rem',
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
    borderRadius: '50%',
    border: `0.1rem solid ${vars.color.gray}`,
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
            backgroundColor: vars.color.gray,
        },
    },
});

export const label = style({
    cursor: 'pointer',
});
