import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    display: 'flex',
    alignItems: 'baseline',
    fontSize: '1.2rem',

    selectors: {
        '&:not(:last-of-type)': {
            marginBottom: '1rem',
        },
    },
});

export const input = style({
    appearance: 'none',
    outline: 'none',
    height: '2rem',
    width: '9rem',
    padding: '0 0.2rem',
    marginRight: '0.6rem',
    backgroundColor: vars.color.white,
    border: `0.1rem solid ${vars.color.gray}`,
    borderRadius: '0.2rem',
});

export const label = style({
    width: '2.5rem',
});
