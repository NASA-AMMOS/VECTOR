import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    display: 'flex',
    height: '92vh',
    width: '100vw',
    overflowX: 'auto',
});

export const item = style({
    display: 'grid',
    margin: '1rem',
    padding: '1rem',
    backgroundColor: vars.color.white,
    borderRadius: '0.4rem',
    cursor: 'pointer',
});

export const header = style({
    paddingBottom: '1rem',
    fontSize: '1.2rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    textAlign: 'center',
});

export const image = style({
    width: 'calc(15vw - 2rem)',
});
