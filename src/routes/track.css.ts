import { style } from '@vanilla-extract/css';
import { vars } from '@/theme.css';

export const container = style({
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gridGap: '1rem',
    padding: '1rem',
    height: '100vh',
    width: `calc(100vw - ${vars.size.sidebar})`,
    overflow: 'hidden',
});

export const stage = style({
    gridColumn: '1 / 5',
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 2rem)',
    padding: '1rem',
    backgroundColor: vars.color.white,
    borderRadius: vars.border.radius,
});

export const trackTitle = style({
    paddingBottom: '1rem',
});

export const track = style({
    marginBottom: '1rem',
});

export const canvas = style({
    height: '100%',
    border: vars.border.standard,
    borderRadius: vars.border.radius,
});

export const charts = style({
    gridColumn: '5 / -1',
    display: 'grid',
    gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
    height: 'calc(100vh - 2rem)',
    backgroundColor: vars.color.white,
    borderRadius: vars.border.radius,
});

export const chart = style({
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    padding: '2rem',

    selectors: {
        '&:not(:last-child)': {
            borderBottom: vars.border.standard,
        },
    },
});

export const chartTitle = style({
    paddingBottom: '1rem',
    textAlign: 'center',
});
