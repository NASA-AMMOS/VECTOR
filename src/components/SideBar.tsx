import { Link, useLocation, useParams } from 'react-router-dom';
import cn from 'classnames';

import Label from '@/components/Label';
import Checkbox from '@/components/Checkbox';
import NumberInput from '@/components/NumberInput';
import Radio from '@/components/Radio';
import Select from '@/components/Select';

import { Filter, ResidualSortField, ResidualSortDirection, useTools } from '@/stores/ToolsContext';
import { useData } from '@/stores/DataContext';

import * as styles from '@/components/SideBar.css';

export default function SideBar() {
    const location = useLocation();
    const { imageName: activeImage, trackId: activeTrack } = useParams();

    const { state, handleChange } = useTools();

    const { tracks, images, initialResidualBounds, finalResidualBounds } = useData();

    return (
        <>
            <nav className={styles.container}>
                <h1 className={styles.header}>VECTOR</h1>
                <div className={styles.section}>
                    <Link
                        className={cn(styles.link, {
                            [styles.active]: location.pathname.includes('overview'),
                        })}
                        to="/overview"
                    >
                        Overview
                    </Link>
                    <Link
                        className={cn(styles.link, {
                            [styles.active]: location.pathname.includes('scene'),
                        })}
                        to="/scene"
                    >
                        Scene
                    </Link>
                    <Link
                        className={cn(styles.link, {
                            [styles.active]: location.pathname.includes('images') && !activeImage,
                        })}
                        to="/images"
                    >
                        Images
                    </Link>
                    {activeImage && (
                        <Link
                            className={cn(styles.link, {
                                [styles.active]: location.pathname.includes(activeImage),
                            })}
                            to={`/images/${activeImage}`}
                        >
                            Image ID: {activeImage}
                        </Link>
                    )}
                    {activeTrack && (
                        <Link
                            className={cn(styles.link, {
                                [styles.active]: location.pathname.includes(activeTrack.toString()),
                            })}
                            to={`/tracks/${activeImage}`}
                        >
                            Track ID: {activeTrack}
                        </Link>
                    )}
                </div>
                {(location.pathname.includes('scene') || location.pathname.includes('track')) && (
                    <div className={styles.section}>
                        <h2 className={styles.subheader}>Scene</h2>
                        <div className={styles.item}>
                            <Checkbox name={Filter.SCENE_CAMERA} checked={state.isCamera} onChange={handleChange}>
                                Camera
                            </Checkbox>
                            <Checkbox name={Filter.SCENE_POINT} checked={state.isPoint} onChange={handleChange}>
                                Point
                            </Checkbox>
                        </div>
                    </div>
                )}
                <div className={styles.section}>
                    <h2 className={styles.subheader}>Residuals</h2>
                    <div className={styles.item}>
                        <Label>Metadata</Label>
                        <p className={styles.text}>Initial: {initialResidualBounds[0][1]}px</p>
                        <p className={styles.text}>Final: {finalResidualBounds[0][1]}px</p>
                    </div>
                    <div className={styles.item}>
                        <Label>Type</Label>
                        <Checkbox
                            name={Filter.INITIAL_RESIDUAL}
                            checked={state.isInitial}
                            onChange={handleChange}
                            isCircled
                        >
                            Initial
                        </Checkbox>
                        <Checkbox
                            name={Filter.FINAL_RESIDUAL}
                            checked={state.isFinal}
                            onChange={handleChange}
                            isCircled
                            isInverted
                        >
                            Final
                        </Checkbox>
                    </div>
                    {!location.pathname.includes('scene') && (
                        <>
                            <div className={styles.item}>
                                <Label>Length</Label>
                                <NumberInput
                                    name={Filter.RESIDUAL_LENGTH_MIN}
                                    value={state.residualMin}
                                    onChange={handleChange}
                                >
                                    Min
                                </NumberInput>
                                <NumberInput
                                    name={Filter.RESIDUAL_LENGTH_MAX}
                                    value={state.residualMax}
                                    onChange={handleChange}
                                >
                                    Max
                                </NumberInput>
                            </div>
                            <div className={styles.item}>
                                <Label>Angle</Label>
                                <NumberInput
                                    name={Filter.RESIDUAL_ANGLE_MIN}
                                    value={state.residualAngleMin}
                                    onChange={handleChange}
                                >
                                    Min
                                </NumberInput>
                                <NumberInput
                                    name={Filter.RESIDUAL_ANGLE_MAX}
                                    value={state.residualAngleMax}
                                    onChange={handleChange}
                                >
                                    Max
                                </NumberInput>
                            </div>
                            {activeImage && (
                                <div className={styles.item}>
                                    <Label>Scale</Label>
                                    <NumberInput
                                        name={Filter.RESIDUAL_SCALE}
                                        value={state.residualScale}
                                        step={0.1}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}
                        </>
                    )}
                    {location.pathname.includes('image') && (
                        <div className={styles.item}>
                            <Label>Sort</Label>
                            <Select
                                name={Filter.RESIDUAL_SORT_FIELD}
                                label="By"
                                value={state.residualSort.field}
                                onChange={handleChange}
                            >
                                <option value={ResidualSortField.INITIAL}>Initial</option>
                                <option value={ResidualSortField.FINAL}>Final</option>
                                <option value={ResidualSortField.SCLK}>Sclk</option>
                            </Select>
                            <Select
                                name={Filter.RESIDUAL_SORT_DIRECTION}
                                label="As"
                                value={state.residualSort.direction}
                                onChange={handleChange}
                            >
                                <option value={ResidualSortDirection.INCREASING}>Increasing</option>
                                <option value={ResidualSortDirection.DECREASING}>Decreasing</option>
                            </Select>
                        </div>
                    )}
                </div>
                {(location.pathname.includes('image') || location.pathname.includes('track')) && (
                    <div className={styles.section}>
                        <h2 className={styles.subheader}>Axes</h2>
                        <div className={styles.item}>
                            <Label>Scale</Label>
                            <Radio name={Filter.RELATIVE_AXIS} checked={state.isRelative} onChange={handleChange}>
                                Relative
                            </Radio>
                            <Radio name={Filter.ABSOLUTE_AXIS} checked={!state.isRelative} onChange={handleChange}>
                                Absolute
                            </Radio>
                        </div>
                    </div>
                )}
                <div className={styles.section}>
                    <h1 className={styles.subheader}>File Information</h1>
                    <div className={styles.item}>
                        <p className={styles.text}>{images.length} Images</p>
                        <p className={styles.text}>{tracks.length} Tracks</p>
                    </div>
                </div>
            </nav>
        </>
    );
}
