import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';
import { TOOLBAR_HEIGHT } from './Toolbar.css';

export const container = style({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: `calc((92vh - ${TOOLBAR_HEIGHT} - 1rem) / 2 - 0.5rem)`,
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: vars.color.white,
    borderRadius: '0.4rem',
});

export const header = style({
    height: 'calc(1.2rem + 1rem)',
    paddingBottom: '1rem',
    fontSize: '1.2rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    textAlign: 'center',
});

export const stage = style({
    height: `calc(((92vh - ${TOOLBAR_HEIGHT} - 1rem) / 2 - 0.5rem) - 2rem - 2.2rem)`,
});
