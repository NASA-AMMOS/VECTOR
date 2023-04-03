import { style } from '@vanilla-extract/css';
import { vars } from '@/theme.css';

export const container = style({
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    height: '100vh',
    width: '100vw',
    backgroundColor: vars.color.background,
});
