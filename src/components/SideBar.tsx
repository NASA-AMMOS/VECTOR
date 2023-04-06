import { Link, useLocation, useParams } from 'react-router-dom';
import cn from 'classnames';

import { ResidualType, useData } from '@/stores/DataContext';
import { Filter, ResidualSortField, ResidualSortDirection, useFilters, AxesType } from '@/stores/FiltersContext';

import Checkbox from '@/components/Checkbox';
import NumberInput from '@/components/NumberInput';
import Radio from '@/components/Radio';
import Select from '@/components/Select';

import { Body, H1, H2, H3 } from '@/styles/headers.css';
import * as styles from '@/components/SideBar.css';

const header = cn(H1, styles.header);
const subheader = cn(H2, styles.subheader);
const label = cn(H3, styles.label);
const body = cn(Body, styles.body);
const link = cn(H2, styles.link);

export default function SideBar() {
    const location = useLocation();
    const { cameraId, trackId } = useParams();

    const { tracks, cameras } = useData();
    const { filterState } = useFilters();

    return (
        <>
            <nav className={styles.container}>
                <Link className={header} to="/">
                    VECTOR
                </Link>
                <div className={styles.section}>
                    <Link
                        className={cn(link, {
                            [styles.active]: location.pathname.includes('overview'),
                        })}
                        to="/overview"
                    >
                        Overview
                    </Link>
                    <Link
                        className={cn(link, {
                            [styles.active]: location.pathname.includes('scene'),
                        })}
                        to="/scene"
                    >
                        Scene
                    </Link>
                    <Link
                        className={cn(link, {
                            [styles.active]: location.pathname.includes('images') && !cameraId,
                        })}
                        to="/images"
                    >
                        Images
                    </Link>
                    {cameraId && (
                        <Link
                            className={cn(link, {
                                [styles.active]: location.pathname.includes(cameraId),
                            })}
                            to={`/images/${cameraId}`}
                        >
                            Image ID: {cameraId}
                        </Link>
                    )}
                    {trackId && (
                        <Link
                            className={cn(link, {
                                [styles.active]: location.pathname.includes(trackId.toString()),
                            })}
                            to={`/tracks/${trackId}`}
                        >
                            Track ID: {trackId}
                        </Link>
                    )}
                </div>
                {location.pathname.includes('scene') && (
                    <div className={styles.section}>
                        <h2 className={subheader}>Scene</h2>
                        <div className={styles.item}>
                            <Checkbox name={Filter.VIEW_CAMERAS} checked={filterState.viewCameras}>
                                Camera
                            </Checkbox>
                            <Checkbox name={Filter.VIEW_POINTS} checked={filterState.viewPoints}>
                                Point
                            </Checkbox>
                        </div>
                    </div>
                )}
                <div className={styles.section}>
                    <h2 className={subheader}>Residuals</h2>
                    <div className={styles.item}>
                        <h3 className={label}>Type</h3>
                        <Checkbox
                            name={Filter.VIEW_INITIAL_RESIDUALS}
                            checked={filterState.viewInitialResiduals}
                            type={ResidualType.INITIAL}
                        >
                            Initial
                        </Checkbox>
                        <Checkbox
                            name={Filter.VIEW_FINAL_RESIDUALS}
                            checked={filterState.viewFinalResiduals}
                            type={ResidualType.FINAL}
                        >
                            Final
                        </Checkbox>
                    </div>
                    <div className={styles.item}>
                        <h3 className={label}>Length</h3>
                        <NumberInput name={Filter.MIN_RESIDUAL_LENGTH} value={filterState.minResidualLength}>
                            Min
                        </NumberInput>
                        <NumberInput name={Filter.MAX_RESIDUAL_LENGTH} value={filterState.maxResidualLength}>
                            Max
                        </NumberInput>
                    </div>
                    <div className={styles.item}>
                        <h3 className={label}>Angle</h3>
                        <NumberInput name={Filter.MIN_RESIDUAL_ANGLE} value={filterState.minResidualAngle}>
                            Min
                        </NumberInput>
                        <NumberInput name={Filter.MAX_RESIDUAL_ANGLE} value={filterState.maxResidualAngle}>
                            Max
                        </NumberInput>
                    </div>
                    {location.pathname.includes('images') && (
                        <div className={styles.item}>
                            <h3 className={label}>Sort</h3>
                            <Select name={Filter.RESIDUAL_SORT_FIELD} label="By" value={filterState.residualSortField}>
                                <option value={ResidualSortField.INITIAL}>Initial</option>
                                <option value={ResidualSortField.FINAL}>Final</option>
                                <option value={ResidualSortField.ACQUISITION_ORDER}>Acqusition Order</option>
                            </Select>
                            <Select
                                name={Filter.RESIDUAL_SORT_DIRECTION}
                                label="As"
                                value={filterState.residualSortDirection}
                            >
                                <option value={ResidualSortDirection.INCREASING}>Increasing</option>
                                <option value={ResidualSortDirection.DECREASING}>Decreasing</option>
                            </Select>
                        </div>
                    )}
                </div>
                {location.pathname.includes('images') && (
                    <div className={styles.section}>
                        <h2 className={subheader}>Axes</h2>
                        <div className={styles.item}>
                            <h3 className={label}>Scale</h3>
                            <Radio name={Filter.USE_RELATIVE_AXES} checked={filterState.axesType === AxesType.RELATIVE}>
                                Relative
                            </Radio>
                            <Radio name={Filter.USE_ABSOLUTE_AXES} checked={filterState.axesType === AxesType.ABSOLUTE}>
                                Absolute
                            </Radio>
                        </div>
                    </div>
                )}
                <div className={styles.section}>
                    <h1 className={subheader}>File Information</h1>
                    <div className={styles.item}>
                        <p className={body}>{cameras.length} Images</p>
                        <p className={body}>{tracks.length} Tracks</p>
                    </div>
                </div>
            </nav>
        </>
    );
}
