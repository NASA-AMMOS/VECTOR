import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const TOOLBAR_HEIGHT = '8vh';

export const container = style({
    height: TOOLBAR_HEIGHT,
    padding: '1rem',
});

export const item = style({
    height: '100%',
    width: '100%',
    padding: '1rem',
    backgroundColor: vars.color.white,
    borderRadius: '0.4rem',
});
