import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '8vh',
    padding: '2rem',
    fontSize: '1.2rem',
    backgroundColor: vars.color.lightBlue,
});

export const button = style({
    padding: '1rem',
    backgroundColor: vars.color.lightWhite,
    color: vars.color.offBlack,
    borderRadius: '0.4rem',
    transition: 'all 0.3s',

    selectors: {
        '&:not(:last-of-type)': {
            marginRight: '1rem',
        },
        '&:hover': {
            backgroundColor: vars.color.offBlack,
            color: vars.color.lightWhite,
        },
    },
});
