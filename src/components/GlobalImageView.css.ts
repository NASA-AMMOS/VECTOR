import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';
import { TOOLBAR_HEIGHT } from './Toolbar.css';

export const container = style({
    display: 'flex',
    height: `calc(92vh - ${TOOLBAR_HEIGHT})`,
    width: '100vw',
    overflowX: 'auto',
});

export const item = style({
    display: 'grid',
    gridTemplateRows: 'minmax(0, 1.25fr) repeat(3, minmax(0, 1fr))',
    margin: '1rem',
    padding: '1rem',
    backgroundColor: vars.color.white,
    borderRadius: '0.4rem',
    cursor: 'pointer',
});

export const header = style({
    paddingBottom: '1rem',
    fontSize: '1.2rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    textAlign: 'center',
});

export const image = style({
    width: 'calc(15vw - 2rem)',
});
