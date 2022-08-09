import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    display: 'flex',
    height: `calc(92vh - ${vars.size.toolbar})`,
    width: '100vw',
});
