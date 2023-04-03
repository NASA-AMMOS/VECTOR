import { style } from '@vanilla-extract/css';
import { vars } from '@/theme.css';

export const container = style({
    display: 'flex',
    alignItems: 'center',

    selectors: {
        '&:not(:last-of-type)': {
            marginBottom: '1rem',
        },
    },
});

export const select = style({
    outline: 'none',
    height: '2rem',
    marginLeft: '0.5rem',
    padding: '0.2rem',
    border: `0.1rem solid ${vars.color.gray}`,
    borderRadius: vars.border.inputRadius,
});
