import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gridGap: '1rem',
    padding: '1rem',
    height: '100vh',
    width: `calc(100vw - ${vars.size.sidebar})`,
});

export const column = style({
    gridColumn: '1 / 4',
    height: 'calc(100vh - 2rem)',
});

export const block = style({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridTemplateRows: '1fr',
    gridGap: '1rem',
    height: 'calc((100vh - 2rem) / 2 - 0.5rem)',
    padding: '1rem',
    backgroundColor: vars.color.white,
    borderRadius: '0.4rem',
});

export const item = style({
    height: 'calc((100vh - 2rem) / 2 - 0.5rem - 2rem)',
});
