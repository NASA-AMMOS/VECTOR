import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gridGap: '1rem',
    padding: '1rem',
    height: '100vh',
    width: `calc(100vw - ${vars.size.sidebar})`,
});

export const panel = style({
    gridColumn: '1 / 5',
    display: 'grid',
    height: 'calc(100vh - 2rem)',
    padding: '1rem',
    backgroundColor: vars.color.white,
    borderRadius: '0.4rem',
});

export const column = style({
    gridColumn: '5 / -1',
    display: 'grid',
    gridTemplateRows: 'minmax(0, 1fr) 2fr 1fr',
    gridGap: '1rem',
    height: 'calc(100vh - 2rem)',
    padding: '1rem',
    backgroundColor: vars.color.white,
    borderRadius: '0.4rem',
});

export const header = style({
    paddingBottom: '1rem',
    fontSize: '1.2rem',
    fontWeight: 500,
    textTransform: 'uppercase',
});

export const bar = style({
    marginBottom: '1rem',
    overflow: 'auto',
});
