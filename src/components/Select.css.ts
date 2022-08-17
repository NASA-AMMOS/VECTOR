import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.2rem',

    selectors: {
        '&:not(:last-of-type)': {
            marginBottom: '1rem',
        },
    },
});

export const select = style({
    outline: 'none',
    height: '3rem',
    marginLeft: '0.5rem',
    padding: '0.2rem',
    border: `0.2rem solid ${vars.color.offWhite}`,
    borderRadius: '0.4rem',
});
