import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

const boxHeight = '6rem';

export const container = style({
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gridGap: '1rem',
    padding: '2rem',
});

export const tracks = style({
    gridColumn: '1 / 4',
});

export const header = style({
    fontSize: '2rem',
    paddingBottom: '1rem',
});

export const track = style({
    marginBottom: '1rem',
});

export const tiepoint = style({
    position: 'relative',
    display: 'inline-block',
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
