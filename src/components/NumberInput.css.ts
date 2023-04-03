import { style } from '@vanilla-extract/css';
import { vars } from '@/theme.css';

export const container = style({
    display: 'flex',
    alignItems: 'baseline',

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
    width: '8rem',
    marginRight: '0.5rem',
    padding: '1rem 0.5rem',
    border: `0.1rem solid ${vars.color.gray}`,
    borderRadius: vars.border.inputRadius,
});
