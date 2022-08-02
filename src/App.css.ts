import { style } from '@vanilla-extract/css';
import { vars } from './utils/theme.css';

export const container = style({
    height: '92vh',
    backgroundColor: vars.color.background,
});
