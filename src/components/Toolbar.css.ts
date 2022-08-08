import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const TOOLBAR_HEIGHT = '14vh';

export const container = style({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: TOOLBAR_HEIGHT,
    padding: '1rem',
});
