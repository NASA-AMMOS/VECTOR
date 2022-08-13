import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    height: '100vh',
    width: `calc(100vw - ${vars.size.sidebar})`,
});
