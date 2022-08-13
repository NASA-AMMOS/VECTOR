import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    display: 'flex',
    height: '100vh',
    width: `calc(100vw - ${vars.size.sidebar})`,
    overflowX: 'auto',
});

export const item = style({
    display: 'grid',
    gridTemplateRows: 'minmax(0, 1.3fr) repeat(3, minmax(0, 1fr))',
    gridGap: '1rem',
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
