import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    display: 'flex',
    minHeight: '92vh',
    width: '100vw',
    overflowX: 'auto',
});

export const item = style({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    margin: '1rem',
    padding: '1rem',
    backgroundColor: vars.color.backgroundBlue,
    borderRadius: '0.4rem',
    cursor: 'pointer',
});

export const image = style({
    width: 'calc(32vw - 2rem)',
});
