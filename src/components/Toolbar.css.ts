import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const TOOLBAR_HEIGHT = '7vh';

export const container = style({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: TOOLBAR_HEIGHT,
    padding: '1rem',
});

export const item = style({
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    padding: '1rem',
    backgroundColor: vars.color.white,
    borderRadius: '0.4rem',
});
