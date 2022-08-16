import { useState, useMemo } from 'react';
import cn from 'classnames';

import Label from '@/components/Label';
import Checkbox from '@/components/Checkbox';
import NumberInput from '@/components/NumberInput';
import Radio from '@/components/Radio';
import EditModal from '@/components/EditModal';

import { Route, useRouter } from '@/stores/RouterContext';
import { Filter, useTools } from '@/stores/ToolsContext';
import { useData } from '@/stores/DataContext';

import * as styles from '@/components/SideBar.css';

export default function SideBar() {
    const router = useRouter();

    const { state, handleChange } = useTools();

    const {
        tiepoints,
        images,
        activeImage,
        activeTrack,
        initialResidualBounds,
        finalResidualBounds,
        editHistory
    } = useData();

    const [activeHistoryModal, setActiveHistoryModal] = useState(false);

    const tracks = useMemo(() => [...new Set(tiepoints.map((t) => t.trackId))], [tiepoints]);

    function handleHistoryClick() {
        setActiveHistoryModal((prevState) => !prevState);
    }

    return (
        <>
            <nav className={styles.container}>
                <h1 className={styles.header}>
                    VECTOR
                </h1>
                <div className={styles.section}>
                    <button
                        className={cn(styles.link, {
                            [styles.active]: router.pathname === Route.CAMERAS
                        })}
                        onClick={() => router.push(Route.CAMERAS)}
                    >
                        Scene
                    </button>
                    <button
                        className={cn(styles.link, {
                            [styles.active]: router.pathname === Route.STATISTICS
                        })}
                        onClick={() => router.push(Route.STATISTICS)}
                    >
                        Overview
                    </button>
                    <button
                        className={cn(styles.link, {
                            [styles.active]: router.pathname === Route.IMAGES
                        })}
                        onClick={() => router.push(Route.IMAGES)}
                    >
                        Images
                    </button>
                    {activeImage && (
                        <button
                            className={cn(styles.link, styles.middleLevel, {
                                [styles.active]: router.pathname === Route.IMAGE
                            })}
                            onClick={() => router.push(Route.IMAGE)}
                        >
                            Active Image
                        </button>
                    )}
                    {activeImage && activeTrack && (
                        <button
                            className={cn(styles.link, styles.lastLevel, {
                                [styles.active]: router.pathname === Route.TRACK
                            })}
                            onClick={() => router.push(Route.TRACK)}
                        >
                            Active Track
                        </button>
                    )}
                </div>
                <div className={styles.section}>
                    <h2 className={styles.subheader}>
                        Residuals
                    </h2>
                    <div className={styles.item}>
                        <Label>
                            Metadata
                        </Label>
                        <p className={styles.text}>
                            Initial: {initialResidualBounds[0][0]}...{initialResidualBounds[0][1]}px
                        </p>
                        <p className={styles.text}>
                            Final: {finalResidualBounds[0][0]}...{finalResidualBounds[0][1]}px
                        </p>
                    </div>
                    <div className={styles.item}>
                        <Label>
                            Type
                        </Label>
                        <Checkbox
                            name={Filter.INITIAL_RESIDUAL}
                            checked={state.isInitial}
                            onChange={handleChange}
                        >
                            Initial
                        </Checkbox>
                        <Checkbox
                            name={Filter.FINAL_RESIDUAL}
                            checked={state.isFinal}
                            onChange={handleChange}
                            isInverted
                        >
                            Final
                        </Checkbox>
                    </div>
                    {router.pathname !== Route.CAMERAS && (
                        <>
                            <div className={styles.item}>
                                <Label>
                                    Length
                                </Label>
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
                                <Label>
                                    Angle
                                </Label>
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
                            {router.pathname === Route.IMAGE && (
                                <div className={styles.item}>
                                    <Label>
                                        Scale
                                    </Label>
                                    <NumberInput
                                        name={Filter.RESIDUAL_SCALE}
                                        value={state.residualScale}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
                {[Route.IMAGES, Route.IMAGE, Route.TRACK].includes(router.pathname) && (
                    <div className={styles.section}>
                        <h2 className={styles.subheader}>
                            Axes
                        </h2>
                        <div className={styles.item}>
                            <Label>
                                Scale
                            </Label>
                            <Radio
                                name={Filter.RELATIVE_AXIS}
                                checked={state.isRelative}
                                onChange={handleChange}
                            >
                                Relative
                            </Radio>
                            <Radio
                                name={Filter.ABSOLUTE_AXIS}
                                checked={!state.isRelative}
                                onChange={handleChange}
                            >
                                Absolute
                            </Radio>
                        </div>
                    </div>
                )}
                <div className={styles.section}>
                    <h1 className={styles.subheader}>
                        File Information
                    </h1>
                    <div className={styles.item}>
                        <p className={styles.text}>
                            {images.length} Images
                        </p>
                        <p className={styles.text}>
                            {tracks.length} Tracks
                        </p>
                        <p className={styles.text}>
                            {tiepoints.length} Tiepoints
                        </p>
                    </div>
                    {editHistory.length > 0 && (
                        <button
                            className={styles.button}
                            onClick={handleHistoryClick}
                        >
                            Edit History
                        </button>
                    )}
                </div>
            </nav>
            {activeHistoryModal && <EditModal handeClose={handleHistoryClick} />}
        </>
    );
}
