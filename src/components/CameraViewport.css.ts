import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    gridColumn: '1 / -1',
    border: `0.1rem solid ${vars.color.black}`,
    borderRadius: '0.4rem',
});
