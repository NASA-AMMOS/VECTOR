import { style } from '@vanilla-extract/css';
import { vars } from '../utils/theme.css';
import { TOOLBAR_HEIGHT } from './Toolbar.css';

export const container = style({
    display: 'flex',
    height: `calc(92vh - ${TOOLBAR_HEIGHT})`,
    width: '100vw',
});
