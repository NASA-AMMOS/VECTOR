import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    paddingBottom: '2rem',
});

export const card = style({
    height: '50%',
    padding: '1rem',
    backgroundColor: vars.color.backgroundBlue,
    borderRadius: '0.4rem',
});
