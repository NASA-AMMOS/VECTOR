import { style } from '@vanilla-extract/css';
import { vars } from '@/theme.css';

export const container = style({
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    height: 'calc((100vh - 2rem) / 2 - 0.5rem)',
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: vars.color.white,
    borderRadius: vars.border.radius,
});

export const header = style({
    paddingBottom: '1rem',
    textTransform: 'uppercase',
    textAlign: 'center',
});

export const image = style({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
});

export const canvas = style({
    maxHeight: '100%',
    maxWidth: '100%',
});
