import { style } from '@vanilla-extract/css';
import { vars } from '@/theme.css';

export const container = style({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: '10rem',
    width: 'fit-content',
    cursor: 'pointer',
    padding: '1rem',
    backgroundColor: vars.color.background,
    borderRadius: vars.border.radius,
    overflow: 'hidden',
});

export const spacer = style({
    marginBottom: '1rem',
    paddingBottom: '1rem',
});

export const expand = style({
    minWidth: '100%',
});

export const subheader = style({
    flexShrink: 0,
    width: '4rem',
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
    height: '100%',
});
