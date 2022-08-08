import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '1rem',
    backgroundColor: vars.color.white,
    borderRadius: '0.4rem',

    selectors: {
        '&:not(:last-of-type)': {
            marginRight: '1rem',
        },
    },
});
