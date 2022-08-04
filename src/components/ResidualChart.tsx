import { useMemo, useRef, useEffect } from 'react';
import { Vector2 } from 'three';
import * as Plot from '@observablehq/plot';
import { Tiepoint, useData } from '@/DataContext';
import { vars } from '@/utils/theme.css';
import { Pixel } from '@/utils/helpers';
import * as styles from '@/components/ResidualChart.css';

const baseVector = new Vector2();

type ResidualChartProps = {
    activeImage?: string;
    activeTrack?: number;
};

function ResidualChart({ activeImage, activeTrack }: ResidualChartProps) {
    const { tiepoints, imageTiepoints } = useData();

    const plot = useRef<HTMLElement>(null);

    const activeTiepoints = useMemo<Tiepoint[]>(() => {
        if (!activeImage && !activeTrack) {
            return tiepoints;
        } else if (activeImage && !activeTrack) {
            return imageTiepoints[activeImage];
        } else if (activeTrack) {
            return tiepoints.filter((t) => t.trackId === Number(activeTrack));
        } else {
            return [];
        }
    }, [tiepoints, imageTiepoints, activeImage]);

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

        const residuals = [...initialResiduals, ...finalResiduals].map((r) => r.Residual);
        const maxResidual = Math.max(...residuals);

        const svg = Plot.plot({
            style: {
                height: '100%',
                fontSize: Pixel(1.5),
                backgroundColor: 'transparent',
            },
            x: {
                label: null,
                ticks: 5,
                domain: [0, maxResidual],
                nice: true,
            },
            y: {
                axis: null,
            },
            marks: [
                Plot.rectY(initialResiduals, Plot.binX({ y: 'count' }, { x: 'Residual', fill: vars.color.initial, thresholds: 15 })),
                Plot.rectY(finalResiduals, Plot.binX({ y: 'count' }, { x: 'Residual', fill: vars.color.final, thresholds: 15 })),
                Plot.ruleY([0]),
            ],
        });

        plot.current.replaceChildren(svg);
    }, [activeTiepoints]);

    return (
        <div ref={plot} className={styles.container}></div>
    );
}

export default ResidualChart;
