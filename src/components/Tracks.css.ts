import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    gridColumn: '4 / -1',
    overflow: 'auto',
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

export const track = style({
    display: 'flex',
    alignItems: 'center',
    height: '10rem',
    width: 'fit-content',
    cursor: 'pointer',
    padding: '1rem',
    backgroundColor: vars.color.background,
    borderRadius: '0.4rem',
});

export const trackSpacing = style({
    marginBottom: '1rem',
    paddingBottom: '1rem',
});

export const subheader = style({
    flexShrink: 0,
    width: '4rem',
    fontSize: '1rem',
    fontWeight: 500,
    textTransform: 'uppercase',
});

export const slope = style({
    flexShrink: 0,
    height: '10rem',
    width: '10rem',
    marginRight: '1rem',
});

export const tiepoints = style({
    display: 'flex',
    alignItems: 'center',
    padding: '1rem',
});

export const tiepoint = style({
    height: 'calc(10rem - 2rem)',
    width: 'calc(10rem - 2rem)',
    marginRight: '1rem',
});
