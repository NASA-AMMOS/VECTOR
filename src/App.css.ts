import { style } from '@vanilla-extract/css';
import { vars } from './utils/theme.css';

export const container = style({
    height: '92vh',
    backgroundColor: vars.color.background,
});

export const subcontainer = style({
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gridGap: '1rem',
    padding: '2rem',
    height: '92vh',
});
