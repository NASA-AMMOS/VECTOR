import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    padding: '1rem',
    marginBottom: '2rem',
    backgroundColor: vars.color.backgroundBlue,
    borderRadius: '0.4rem',
});

export const header = style({
    paddingBottom: '1rem',
});
