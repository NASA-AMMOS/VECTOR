import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';

export const container = style({
    display: 'flex',
    flexDirection: 'column',
    height: 'calc((92vh - 4rem) / 2 - 0.5rem)',
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: vars.color.background,
    borderRadius: '0.4rem',
});

export const header = style({
    paddingBottom: '1rem',
    fontSize: '1.2rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    textAlign: 'center',
});
