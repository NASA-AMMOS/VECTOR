import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

const boxHeight = '6rem';

export const container = style({
    gridColumn: '4 / -1',
    overflow: 'auto',
    padding: '1rem',
    backgroundColor: vars.color.backgroundBlue,
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
    marginBottom: '1rem',
    paddingBottom: '1rem',
    cursor: 'pointer',
});

export const subheader = style({
    flexShrink: 0,
    width: '5rem',
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
});

export const tiepoint = style({
    position: 'relative',
    display: 'flex',
    border: `0.2rem solid ${vars.color.black}`,
    height: boxHeight,

    selectors: {
        '&:not(:last-of-type)': {
            marginRight: '1rem',
        },
        '&::after': {
            content: '',
            position: 'absolute',
            top: 0,
            left: '50%',
            height: '100%',
            width: '0.2rem',
            borderLeft: `0.2rem solid ${vars.color.black}`,
        },
    },
});

export const residual = style({
    display: 'inline-block',
    height: `calc(${boxHeight} - 0.4rem)`,
    width: `calc(${boxHeight} - 0.4rem)`,
    backgroundColor: vars.color.red,
    overflow: 'hidden',
});
