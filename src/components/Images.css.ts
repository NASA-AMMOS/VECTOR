import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gridGap: '1rem',
    margin: '1rem',
    padding: '1rem',
    border: `0.1rem solid ${vars.color.black}`,
    borderRadius: '0.4rem',
    cursor: 'pointer',
});

export const image = style({
    maxWidth: '100%',
    gridColumn: '1 / 3',
});

export const content = style({
    gridColumn: '3 / 5',
    fontSize: '1.4rem',
});

export const text = style({
    selectors: {
        '&:not(:last-of-type)': {
            marginBottom: '1rem',
        },
    },
});
