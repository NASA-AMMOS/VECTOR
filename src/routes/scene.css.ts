import { style } from '@vanilla-extract/css';
import { vars } from '@/theme.css';

export const container = style({
    gridColumn: '2 / -1',
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gridGap: '1rem',
    height: '100vh',
    width: `calc(100vw - ${vars.size.sidebar})`,
    padding: '1rem',
    overflow: 'hidden',
});

export const header = style({
    width: '100%',
    margin: '1rem 0',
    textAlign: 'center',
    fontWeight: 500,
});

export const canvas = style({
    gridColumn: '1 / 9',
    height: '100%',
    width: '100%',
    padding: '1rem',
    backgroundColor: vars.color.white,
    borderRadius: vars.border.radius,
    overflow: 'hidden',
});

export const charts = style({
    gridColumn: '9 / -1',
    height: '100%',
    width: '100%',
    backgroundColor: vars.color.white,
    borderRadius: vars.border.radius,
});

export const item = style({
    padding: '2rem',

    selectors: {
        '&:not(:last-child)': {
            borderBottom: vars.border.standard,
        },
    },
});
