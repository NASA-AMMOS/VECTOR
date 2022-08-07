import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';
import { TOOLBAR_HEIGHT } from './Toolbar.css';

export const grid = style({
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gridGap: '1rem',
    padding: '1rem',
    paddingTop: '0',
    height: `calc(92vh - ${TOOLBAR_HEIGHT})`,
});

export const column = style({
    gridColumn: '1 / 4',
    height: `calc(92vh - ${TOOLBAR_HEIGHT} - 4rem)`,
});

export const block = style({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridTemplateRows: '1fr',
    height: `calc((92vh - ${TOOLBAR_HEIGHT} - 4rem) / 2 - 0.5rem)`,
    padding: '1rem',
    backgroundColor: vars.color.white,
    borderRadius: '0.4rem',
});

export const item = style({
    height: `calc((92vh - ${TOOLBAR_HEIGHT} - 4rem) / 2 - 0.5rem - 2rem)`,
});
