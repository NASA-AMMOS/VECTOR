import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    fontSize: '1.6rem',
    marginBottom: '1rem',

    '@media': {
        'screen and (max-width: 1200px)': {
            fontSize: '1rem',
        },
    },
});

