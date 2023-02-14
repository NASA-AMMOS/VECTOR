import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    position: 'fixed',
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: '0 0.8rem',
    backgroundColor: vars.color.white,
    border: `0.1rem solid ${vars.color.black}`,
    borderRadius: '0.4rem',
    fontSize: '1.2rem',
    overflow: 'hidden',
});

export const button = style({
    padding: '0.8rem 0',
    textAlign: 'left',

    selectors: {
        '&:not(:last-child)': {
            borderBottom: `0.1rem solid ${vars.color.black}`,
        },
        '&:disabled': {
            opacity: 0.4,
            cursor: 'not-allowed',
        },
    },
});
