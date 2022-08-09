import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
});

export const empty = style({
    position: 'relative',
    height: '100%',
    backgroundColor: vars.color.offWhite,
    borderRadius: '0.4rem',

    selectors: {
        '&::after': {
            content: '"No Data"',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '1.2rem',
            textAlign: 'center',
        },
    },
});
