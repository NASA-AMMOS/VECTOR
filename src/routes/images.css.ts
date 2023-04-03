import { style } from '@vanilla-extract/css';
import { vars } from '@/theme.css';

export const container = style({
    display: 'flex',
    height: '100vh',
    width: `calc(100vw - ${vars.size.sidebar})`,
    overflowX: 'auto',
});

export const panel = style({
    display: 'grid',
    gridTemplateRows: 'minmax(0, 1.3fr) repeat(3, minmax(0, 1fr))',
    gridGap: '1rem',
    margin: '1rem',
    backgroundColor: vars.color.white,
    borderRadius: vars.border.radius,
    cursor: 'pointer',
});

export const item = style({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem',
    borderBottom: vars.border.standard,
});

export const header = style({
    paddingBottom: '1rem',
    textTransform: 'uppercase',
    textAlign: 'center',
});

export const image = style({
    width: '100%',
});
