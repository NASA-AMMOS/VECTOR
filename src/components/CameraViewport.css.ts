import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    gridColumn: '1 / -1',
    height: '100%',
    width: '100%',
    border: `0.4rem solid ${vars.color.background}`,
    borderRadius: '0.4rem',
});
