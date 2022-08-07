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

export const panel = style({
    gridColumn: '1 / 5',
    display: 'grid',
    height: `calc(92vh - ${TOOLBAR_HEIGHT} - 1rem)`,
    padding: '1rem',
    backgroundColor: vars.color.white,
    borderRadius: '0.4rem',
});

export const column = style({
    gridColumn: '5 / -1',
    display: 'grid',
    gridGap: '1rem',
    height: `calc(92vh - ${TOOLBAR_HEIGHT} - 1rem)`,
    padding: '1rem',
    backgroundColor: vars.color.white,
    borderRadius: '0.4rem',
});

export const header = style({
    paddingBottom: '1rem',
    fontSize: '1.2rem',
    fontWeight: 500,
    textTransform: 'uppercase',
});

export const bar = style({
    marginBottom: '1rem',
    overflow: 'auto',
});

export const item = style({
    height: `calc((92vh - ${TOOLBAR_HEIGHT} - 1rem) / 3 - 2rem)`,
})
