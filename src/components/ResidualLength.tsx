import { useMemo, useRef, useEffect } from 'react';
import { Vector2 } from 'three';
import * as Plot from '@observablehq/plot';
import { useData } from '@/DataContext';
import { vars } from '@/utils/theme.css';
import { Pixel } from '@/utils/helpers';
import * as styles from '@/components/ResidualLength.css';

function ResidualLength({ activeImage, activeTrack }) {
    const { tiepoints } = useData();

    const activeTiepoints = useMemo(() => {
        const newTiepoints = tiepoints[activeImage];
        if (!activeTrack) {
            return newTiepoints;
        }
        return newTiepoints.filter((t) => t.trackId === Number(activeTrack));
    }, [activeImage, tiepoints]);

    const plot = useRef(null);

    const baseVector = new Vector2();

    useEffect(() => {
        const initialResiduals = [];
        const finalResiduals = [];

        for (const tiepoint of activeTiepoints) {
            const initialResidual = new Vector2(...tiepoint.initialResidual);
            const finalResidual = new Vector2(...tiepoint.finalResidual);

            const initialDistance = Number(baseVector.distanceTo(initialResidual).toFixed(1));
            const finalDistance = Number(baseVector.distanceTo(finalResidual).toFixed(1));

            initialResiduals.push({ Residual: initialDistance, initial: true });
            finalResiduals.push({ Residual: finalDistance, initial: false });
        }

        const svg = Plot.plot({
            style: {
                height: '100%',
                background: vars.color.backgroundBlue,
                fontSize: Pixel(1.5),
            },
            x: {
                label: null,
                ticks: 5,
            },
            y: {
                axis: null,
            },
            marks: [
                Plot.rectY(initialResiduals, Plot.binX({ y: 'count' }, { x: 'Residual', fill: vars.color.darkBlue, thresholds: 15 })),
                Plot.rectY(finalResiduals, Plot.binX({ y: 'count' }, { x: 'Residual', fill: vars.color.lightBlue, thresholds: 15 })),
                Plot.ruleY([0]),
            ],
        });

        plot.current.replaceChildren(svg);
    }, [activeTiepoints]);

    return (
        <div ref={plot} className={styles.container}></div>
    );
}

export default ResidualLength;
