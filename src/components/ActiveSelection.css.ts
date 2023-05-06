import { style } from '@vanilla-extract/css';
import { vars } from '@/theme.css';

export const container = style({
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    backgroundColor: vars.color.white,
    border: vars.border.standard,
    borderRadius: vars.border.radius,
    boxShadow: `0.1rem 0.1rem 0.2rem ${vars.color.gray}`,
});

export const text = style({
    padding: '1rem',
    borderBottom: vars.border.standard,
    textAlign: 'center',
});

export const button = style({
    display: 'block',
    width: '100%',
    padding: '1rem',
    backgroundColor: vars.color.background,
    transition: 'opacity 0.3s',

    selectors: {
        '&:not(:first-of-type)': {
            marginTop: '1rem',
        },

        '&:hover': {
            opacity: 0.8,
        },
    },
});
