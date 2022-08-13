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
    padding: '0 0.5rem',
    marginRight: '0.6rem',
    backgroundColor: vars.color.offWhite,
    border: 'none',
    borderRadius: '0.4rem',
});
