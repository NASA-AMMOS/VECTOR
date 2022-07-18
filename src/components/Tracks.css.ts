import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

const boxHeight = '6rem';

export const container = style({
    gridColumn: '1 / 4',
    overflowY: 'auto',
    overflowX: 'auto',
});

export const track = style({
    display: 'flex',
    marginBottom: '1rem',
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
