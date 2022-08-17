import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    display: 'flex',
    alignItems: 'center',
    height: '2rem',
    fontSize: '1.2rem',

    selectors: {
        '&:not(:last-of-type)': {
            marginBottom: '0.4rem',
        },
    },
});

export const input = style({
    appearance: 'none',
    position: 'relative',
    height: '1.4rem',
    width: '1.4rem',
    marginRight: '0.4rem',
    transition: 'all 0.3s',
    borderRadius: '0.2rem',
    border: `0.1rem solid ${vars.color.gray}`,
    cursor: 'pointer',

    selectors: {
        '&::after': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'inline-block',
            height: '1rem',
            width: '1rem',
            transition: 'all 0.3s',
        },
        '&:checked::after': {
            backgroundColor: vars.color.gray,
        },
    },
});

export const label = style({
    cursor: 'pointer',
});

export const circle = style({
    display: 'inline-block',
    height: '0.8rem',
    width: '0.8rem',
    borderRadius: '50%',
    backgroundColor: vars.color.initial,

    selectors: {
        '&:last-child': {
            marginLeft: '0.4rem',
        },
    },
})

export const inverted = style({
    backgroundColor: vars.color.final,
});
