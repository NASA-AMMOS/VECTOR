import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';
import { TOOLBAR_HEIGHT } from './Toolbar.css';

export const container = style({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    height: `calc(92vh - ${TOOLBAR_HEIGHT})`,
    width: '100vw',
});

export const item = style({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: `calc(92vh - ${TOOLBAR_HEIGHT} - 2rem)`,
    margin: '1rem',
    padding: '2rem',
    backgroundColor: vars.color.white,
    borderRadius: '0.4rem',
});

export const title = style({
    marginBottom: '2rem',
    fontSize: '2rem',
    fontWeight: 500,
});
