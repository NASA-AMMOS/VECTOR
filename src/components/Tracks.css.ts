import { style } from '@vanilla-extract/css';
import { vars } from '@/theme.css';

export const container = style({
    gridColumn: '4 / -1',
    overflow: 'auto',
    padding: '1rem',
    backgroundColor: vars.color.white,
    borderRadius: vars.border.radius,
});

export const header = style({
    paddingBottom: '1rem',
    textTransform: 'uppercase',
});
