import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    display: 'flex',
    height: '92vh',
    width: '100vw',
    overflowX: 'auto',
});

export const item = style({
    display: 'flex',
    flexDirection: 'column',
    margin: '1rem',
    padding: '1rem',
    border: `0.1rem solid ${vars.color.black}`,
    borderRadius: '0.4rem',
    cursor: 'pointer',
});

export const image = style({
    width: 'calc(30vw - 2rem)',
    paddingBottom: '1rem',
});
