import { useMemo, useRef, useState, useEffect } from 'react';
import { Vector2 } from 'three';
import * as Plot from '@observablehq/plot';
import { useData } from '@/DataContext';
import { vars } from '@/utils/theme.css';

function ResidualLength({ activeImage }) {
    const { tiepoints } = useData();

    const activeTiepoints = useMemo(() => tiepoints[activeImage], [activeImage, tiepoints]);

    const plot = useRef();

    const baseVector = new Vector2();

    useEffect(() => {
        const residuals = [];

        for (const tiepoint of activeTiepoints) {
            const initialResidual = new Vector2(...tiepoint.initialResidual);
            const finalResidual = new Vector2(...tiepoint.finalResidual);

            const initialDistance = Number(baseVector.distanceTo(initialResidual).toFixed(1));
            const finalDistance = Number(baseVector.distanceTo(finalResidual).toFixed(1));

            residuals.push({ Residual: initialDistance, initial: true });
            residuals.push({ Residual: finalDistance, initial: false });
        }

        const svg = Plot.plot({
            marks: [
                Plot.rectY(residuals, Plot.binX({ y: 'count' }, { x: 'Residual', fill: (d) => d.initial ? vars.color.darkBlue : vars.color.lightBlue })),
            ],
        });

        plot.current.replaceChildren(svg);
    }, [activeTiepoints]);

    return (
        <div ref={plot}></div>
    );
}

export default ResidualLength;
