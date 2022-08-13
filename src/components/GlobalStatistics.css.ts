import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    display: 'inline-grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridGap: '1rem',
    height: '100vh',
    width: `calc(100vw - ${vars.size.sidebar})`,
    padding: '1rem',
});

export const item = style({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
    backgroundColor: vars.color.white,
    borderRadius: '0.4rem',
});

export const title = style({
    marginBottom: '2rem',
    fontSize: '2rem',
    fontWeight: 500,
});
