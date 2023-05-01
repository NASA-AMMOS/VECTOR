import { style } from '@vanilla-extract/css';
import { vars } from '@/theme.css';

export const container = style({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: '10rem',
    width: 'fit-content',
    cursor: 'pointer',
    backgroundColor: vars.color.background,
    borderRadius: vars.border.radius,
    overflow: 'hidden',

    selectors: {
        '&:not(:last-child)': {
            marginBottom: '1rem',
        },
    },
});

export const edited = style({
    opacity: 0.5,
});

export const button = style({
    height: '100%',
    padding: '1rem',
    borderRight: vars.border.white,
    color: vars.color.final,
    textTransform: 'uppercase',
});

export const subheader = style({
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '6rem',
    padding: '1rem',
    borderRight: vars.border.white,
    textTransform: 'uppercase',
});

export const slope = style({
    flexShrink: 0,
    height: '10rem',
    width: '10rem',
    padding: '1rem',
    borderRight: vars.border.white,
});

export const canvas = style({
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    padding: '1rem',

    selectors: {
        '&:not(:first-of-type)': {
            paddingLeft: 0,
        },
    },
});
