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

    const { images, setImages, cameraPointMap, maxResidualLength } = useData();
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

        for (const image of images) {
            const imageAngles: RadialChartPoint[] = [];
            const imageLengths: HistogramChartPoint[][] = [[], []];
            const imagePoints: SlopeChartPoint[] = [];

            const imageResiduals: number[] = [];

            for (const point of cameraPointMap[image.camera.id]) {
                if (guardInitialPoint(point)) {
                    imageAngles.push({
                        radius: point.initialResidualLength,
                        angle: point.initialResidualAngle,
                        type: ResidualType.INITIAL,
                    });
                    imageLengths[0].push({ x: point.initialResidualLength, type: ResidualType.INITIAL });

                    if (filterState.residualSortField === ResidualSortField.INITIAL) {
                        imageResiduals.push(point.initialResidualLength);
                    }
                }

                if (guardFinalPoint(point)) {
                    imageAngles.push({
                        radius: point.finalResidualLength,
                        angle: point.finalResidualAngle,
                        type: ResidualType.FINAL,
                    });
                    imageLengths[1].push({ x: point.finalResidualLength, type: ResidualType.FINAL });

                    if (filterState.residualSortField === ResidualSortField.FINAL) {
                        imageResiduals.push(point.finalResidualLength);
                    }
                }

                if (guardPoint(point)) {
                    imagePoints.push(
                        { type: ResidualType.INITIAL, index: point.index, value: point.initialResidualLength },
                        { type: ResidualType.FINAL, index: point.index, value: point.finalResidualLength },
                    );
                }
            }

            newAngles[image.camera.id] = imageAngles;
            newLengths[image.camera.id] = imageLengths.filter((v) => v.length > 0);
            newPoints[image.camera.id] = imagePoints;

            maxResiduals[image.camera.id] = Math.max.apply(Math, imageResiduals);
        }

        const newImages = images.slice(0);
        if (filterState.residualSortField === ResidualSortField.ACQUISITION_ORDER) {
            newImages.sort((a, b) => {
                const aId = a.camera.id;
                const bId = b.camera.id;

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
            newImages.sort((a, b) => {
                const aResiduals = maxResiduals[a.camera.id];
                const bResiduals = maxResiduals[b.camera.id];

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

        setImages(newImages);

        setResidualAngles(newAngles);
        setResidualLengths(newLengths);
        setResidualPoints(newPoints);
    }, [filterState]);

    return (
        <section className={styles.container}>
            {images.map((image) => (
                <div key={image.camera.id} className={styles.panel} onClick={() => handleClick(image.camera.id)}>
                    <div className={styles.item}>
                        <h2 className={cn(H2, styles.header)}>{image.camera.id}</h2>
                        <img className={styles.image} src={image.url} alt={`Image Name: ${image.name}`} />
                    </div>
                    <div className={styles.item}>
                        {image.camera.id in residualAngles && (
                            <RadialChart
                                data={residualAngles[image.camera.id]}
                                maxRadius={filterState.axesType === AxesType.ABSOLUTE ? maxResidualLength : null}
                            />
                        )}
                    </div>
                    <div className={styles.item}>
                        {image.camera.id in residualLengths && (
                            <HistogramChart data={residualLengths[image.camera.id]} hideAxes />
                        )}
                    </div>
                    {image.camera.id in residualPoints && (
                        <SlopeChart
                            data={residualPoints[image.camera.id]}
                            yDomain={filterState.axesType === AxesType.ABSOLUTE ? [0, maxResidualLength] : null}
                        />
                    )}
                </div>
            ))}
        </section>
    );
}
