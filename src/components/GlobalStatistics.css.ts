import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    height: '92vh',
    width: '100vw',
});

export const item = style({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '92vh',
})
