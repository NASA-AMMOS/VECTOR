import { style } from '@vanilla-extract/css';
import { vars } from '@/theme.css';

export const stage = style({
    height: '100%',
    width: '100%',
    border: vars.border.standard,
    borderRadius: vars.border.radius,
});

export const canvas = style({
    overflow: 'hidden',
});
