import { style } from '@vanilla-extract/css';

export const container = style({
    minHeight: '92vh',
});

export const subcontainer = style({
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gridGap: '1rem',
    padding: '2rem',
    height: '92vh',
});

export const list = style({
    gridColumn: '1 / 4',
    display: 'flex',
    flexDirection: 'column',
});
