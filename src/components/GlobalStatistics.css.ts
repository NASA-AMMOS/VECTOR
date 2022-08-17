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

export const legend = style({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '6rem',
    width: '100%',
});

export const axis = style({
    height: '100%',
});

export const colors = style({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    height: '100%',
});

export const color = style({
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.2rem',
});

export const circle = style({
    display: 'inline-block',
    height: '1.2rem',
    width: '1.2rem',
    marginRight: '0.6rem',
    borderRadius: '50%',
    backgroundColor: vars.color.initial,
});

export const inverted = style({
    backgroundColor: vars.color.final,
})
