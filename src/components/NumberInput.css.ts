import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.2rem',

    selectors: {
        '&:not(:last-of-type)': {
            marginRight: '1.4rem',
        },
    },
});

export const input = style({
    appearance: 'none',
    outline: 'none',
    height: '2rem',
    width: '8rem',
    marginLeft: '0.6rem',
    backgroundColor: vars.color.white,
    border: `0.1rem solid ${vars.color.initialHex}`,
});

export const label = style({});
