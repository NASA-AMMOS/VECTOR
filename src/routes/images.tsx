import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cn from 'classnames';

import { ResidualType, useData } from '@/stores/DataContext';
import { AxesType, ResidualSortDirection, ResidualSortField, useFilters } from '@/stores/FiltersContext';

import RadialChart, { RadialChartPoint } from '@/charts/radial';
import HistogramChart, { HistogramChartPoint } from '@/charts/histogram';
import SlopeChart, { SlopeChartPoint } from '@/charts/slope';

import { H2 } from '@/styles/headers.css';
import * as styles from '@/routes/images.css';

type CameraLengthMap = Record<string, HistogramChartPoint[][]>;
type CameraAngleMap = Record<string, RadialChartPoint[]>;
type CameraPointMap = Record<string, SlopeChartPoint[]>;

export default function Images() {
    const navigate = useNavigate();

    const { cameras, images, cameraPointMap, maxResidualLength } = useData();
    const { filterState, guardInitialPoint, guardFinalPoint, guardPoint } = useFilters();

    const [residualAngles, setResidualAngles] = useState<CameraAngleMap>({});
    const [residualLengths, setResidualLengths] = useState<CameraLengthMap>({});
    const [residualPoints, setResidualPoints] = useState<CameraPointMap>({});

    const handleClick = (name: string) => {
        navigate(`/images/${name}`);
    };

    useEffect(() => {
        const newAngles: CameraAngleMap = {};
        const newLengths: CameraLengthMap = {};
        const newPoints: CameraPointMap = {};

        // TODO: Cache this?
        const maxResiduals: { [key: string]: number } = {};

        for (const camera of cameras) {
            const cameraAngles: RadialChartPoint[] = [];
            const cameraLengths: HistogramChartPoint[][] = [[], []];
            const cameraPoints: SlopeChartPoint[] = [];

            const imageResiduals: number[] = [];

            for (const point of cameraPointMap[camera.id]) {
                if (guardInitialPoint(point)) {
                    cameraAngles.push({
                        radius: point.initialResidualLength,
                        angle: point.initialResidualAngle,
                        type: ResidualType.INITIAL,
                    });
                    cameraLengths[0].push({ x: point.initialResidualLength, type: ResidualType.INITIAL });

                    if (filterState.residualSortField === ResidualSortField.INITIAL) {
                        imageResiduals.push(point.initialResidualLength);
                    }
                }

                if (guardFinalPoint(point)) {
                    cameraAngles.push({
                        radius: point.finalResidualLength,
                        angle: point.finalResidualAngle,
                        type: ResidualType.FINAL,
                    });
                    cameraLengths[1].push({ x: point.finalResidualLength, type: ResidualType.FINAL });

                    if (filterState.residualSortField === ResidualSortField.FINAL) {
                        imageResiduals.push(point.finalResidualLength);
                    }
                }

                if (guardPoint(point)) {
                    cameraPoints.push(
                        { type: ResidualType.INITIAL, index: point.id, value: point.initialResidualLength },
                        { type: ResidualType.FINAL, index: point.id, value: point.finalResidualLength },
                    );
                }
            }

            newAngles[camera.id] = cameraAngles;
            newLengths[camera.id] = cameraLengths.filter((v) => v.length > 0);
            newPoints[camera.id] = cameraPoints;

            maxResiduals[camera.id] = Math.max.apply(Math, imageResiduals);
        }

        const newCameras = cameras.slice(0);
        if (filterState.residualSortField === ResidualSortField.ACQUISITION_ORDER) {
            newCameras.sort((a, b) => {
                const aId = a.id;
                const bId = b.id;

                if (filterState.residualSortDirection === ResidualSortDirection.DECREASING) {
                    if (aId > bId) {
                        return -1;
                    } else if (aId < bId) {
                        return 1;
                    }
                    return 0;
                } else if (filterState.residualSortDirection === ResidualSortDirection.INCREASING) {
                    if (aId < bId) {
                        return -1;
                    } else if (aId > bId) {
                        return 1;
                    }
                    return 0;
                }

                return 0;
            });
        } else {
            newCameras.sort((a, b) => {
                const aResiduals = maxResiduals[a.id];
                const bResiduals = maxResiduals[b.id];

                if (filterState.residualSortDirection === ResidualSortDirection.DECREASING) {
                    if (aResiduals > bResiduals) {
                        return -1;
                    } else if (aResiduals < bResiduals) {
                        return 1;
                    }
                    return 0;
                } else if (filterState.residualSortDirection === ResidualSortDirection.INCREASING) {
                    if (aResiduals < bResiduals) {
                        return -1;
                    } else if (aResiduals > bResiduals) {
                        return 1;
                    }
                    return 0;
                }

                return 0;
            });
        }

        // setCameras(newCameras);

        setResidualAngles(newAngles);
        setResidualLengths(newLengths);
        setResidualPoints(newPoints);
    }, [filterState]);

    return (
        <section className={styles.container}>
            {cameras.map((camera) => (
                <div key={camera.id} className={styles.panel} onClick={() => handleClick(camera.id)}>
                    <div className={styles.item}>
                        <h2 className={cn(H2, styles.header)}>{camera.id}</h2>
                        <img
                            className={styles.image}
                            src={images[camera.imageName].url}
                            alt={`Camera ID: ${camera.id}`}
                        />
                    </div>
                    <div className={styles.item}>
                        {camera.id in residualAngles && (
                            <RadialChart
                                data={residualAngles[camera.id]}
                                maxRadius={filterState.axesType === AxesType.ABSOLUTE ? maxResidualLength : null}
                            />
                        )}
                    </div>
                    <div className={styles.item}>
                        {camera.id in residualLengths && <HistogramChart data={residualLengths[camera.id]} hideAxes />}
                    </div>
                    {camera.id in residualPoints && (
                        <SlopeChart
                            data={residualPoints[camera.id]}
                            yDomain={filterState.axesType === AxesType.ABSOLUTE ? [0, maxResidualLength] : null}
                        />
                    )}
                </div>
            ))}
        </section>
    );
}
