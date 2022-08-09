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
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: '10rem',
    width: 'fit-content',
    cursor: 'pointer',
    padding: '1rem',
    backgroundColor: vars.color.background,
    borderRadius: '0.4rem',
    overflow: 'hidden',
});

export const trackSpacing = style({
    marginBottom: '1rem',
    paddingBottom: '1rem',
});

export const trackWidth = style({
    minWidth: '100%',
});

export const trackEdited = style({
    selectors: {
        '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            backgroundColor: vars.color.black,
            opacity: 0.5,
        },
    },
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
    height: '100%',
});
