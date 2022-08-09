import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: vars.size.toolbar,
    padding: '1rem',
});
