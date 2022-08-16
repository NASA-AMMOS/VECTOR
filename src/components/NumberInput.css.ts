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
    width: '6rem',
    marginRight: '0.5rem',
    padding: '1rem 0.5rem',
    border: `0.2rem solid ${vars.color.offWhite}`,
    borderRadius: '0.4rem',
});
