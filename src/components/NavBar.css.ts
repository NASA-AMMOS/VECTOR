import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '8vh',
    padding: '2rem',
    fontSize: '1.2rem',
    backgroundColor: vars.color.gray,
});

export const button = style({
    padding: '1rem',
    backgroundColor: vars.color.offBlack,
    color: vars.color.white,
    borderRadius: '0.4rem',

    selectors: {
        '&:not(:last-of-type)': {
            marginRight: '1rem',
        },
    },
});
