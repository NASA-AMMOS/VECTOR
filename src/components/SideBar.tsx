import { useState } from 'react';
import cn from 'classnames';

import Label from '@/components/Label';
import Checkbox from '@/components/Checkbox';
import NumberInput from '@/components/NumberInput';
import Radio from '@/components/Radio';

import { Route, useRouter } from '@/stores/RouterContext';
import { Filter, useTools } from '@/stores/ToolsContext';
import { useData } from '@/stores/DataContext';

import * as styles from '@/components/SideBar.css';

export default function SideBar() {
    const router = useRouter();

    const { state, handleChange } = useTools();

    const { activeImage, activeTrack, editHistory } = useData();

    const [activeHistoryModal, setActiveHistoryModal] = useState(false);

    function handleHistoryClick() {
        setActiveHistoryModal((prevState) => !prevState);
    }

    return (
        <>
            <nav className={styles.container}>
                <div>
                    <h1 className={styles.header}>
                        VECTOR
                    </h1>
                    {editHistory.length > 0 && (
                        <p className={cn(styles.item, styles.edited)}>
                            Edited
                        </p>
                    )}
                    <div className={styles.section}>
                        <button
                            className={cn(styles.button, {
                                [styles.active]: router.pathname === Route.CAMERAS
                            })}
                            onClick={() => router.push(Route.CAMERAS)}
                        >
                            Scene
                        </button>
                        <button
                            className={cn(styles.button, {
                                [styles.active]: router.pathname === Route.STATISTICS
                            })}
                            onClick={() => router.push(Route.STATISTICS)}
                        >
                            Overview
                        </button>
                        <button
                            className={cn(styles.button, {
                                [styles.active]: router.pathname === Route.IMAGES
                            })}
                            onClick={() => router.push(Route.IMAGES)}
                        >
                            Images
                        </button>
                        {activeImage && (
                            <button
                                className={cn(styles.button, {
                                    [styles.active]: router.pathname === Route.IMAGE
                                })}
                                onClick={() => router.push(Route.IMAGE)}
                            >
                                Active Image
                            </button>
                        )}
                        {activeImage && activeTrack && (
                            <button
                                className={cn(styles.button, {
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
                            </>
                        )}
                    </div>
                    {router.pathname === Route.IMAGES && (
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
                </div>
                <div className={styles.section}>
                    {editHistory.length > 0 && (
                        <button
                            className={cn(styles.button, styles.active)}
                            onClick={handleHistoryClick}
                        >
                            Edit History
                        </button>
                    )}
                    <button className={cn(styles.button, styles.active)}>
                        Files
                    </button>
                </div>
            </nav>
            {activeHistoryModal && (
                <>
                    <div className={styles.shadow} />
                    <div className={styles.modal}>
                        <div className={styles.top}>
                            <h2 className={styles.header}>
                                Edit History
                            </h2>
                            <div className={styles.close} onClick={handleHistoryClick}>
                                +
                            </div>
                        </div>
                        <div className={styles.edits}>
                            {editHistory.map(({ id, type, operation }) => (
                                <p
                                    key={`${type}_${id}_${operation}`}
                                    className={styles.edit}
                                >
                                    &gt; {type} {operation} {id}
                                </p>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
