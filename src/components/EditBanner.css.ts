import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    position: 'fixed',
    top: 0,
    left: vars.size.sidebar,
    width: `calc(100vw - ${vars.size.sidebar})`,
    padding: '2rem',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: vars.color.white,
    fontSize: '1.2rem',
    fontStyle: 'italic',
});
