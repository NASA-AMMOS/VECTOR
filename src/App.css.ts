import { style } from '@vanilla-extract/css';
import { vars } from './utils/theme.css';

export const container = style({
    minHeight: '92vh',
});

export const subcontainer = style({
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gridGap: '1rem',
    padding: '2rem',
    height: '92vh',
});

export const block = style({
    gridColumn: '1 / 4',
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(92vh - 4rem)',
});

export const item = style({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '50%',
    padding: '1rem',
    backgroundColor: vars.color.backgroundBlue,
    borderRadius: '0.4rem',
});
