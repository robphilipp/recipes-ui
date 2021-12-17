import React, {useState} from 'react'
import {isEmptyRequiredTime, RequiredTime, Time, TimeUnits, timeUnitsFrom} from "./Recipe";
import {IconButton, MenuItem, Select, SelectChangeEvent, TextField} from "@mui/material";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import {DisplayMode} from "./FormMode";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CancelIcon from "@mui/icons-material/Cancel";

function noop() {}

type Props = {
    requiredTime: RequiredTime
    initialMode?: DisplayMode
    onSubmit?: (time: RequiredTime) => void
    onCancel?: () => void
}

export function RequiredTimeForm(props: Props): JSX.Element {
    const {
        initialMode = DisplayMode.VIEW,
        onSubmit = noop,
        onCancel = noop,
    } = props

    const [requiredTime, setRequiredTime] = useState<RequiredTime>(() => props.requiredTime)
    const [mode, setMode] = useState<DisplayMode>(initialMode)


    function handleTotalUnitSelect(event: SelectChangeEvent): void {
        setRequiredTime(current => ({
            ...current,
            total: {
                ...current.total,
                unit: timeUnitsFrom(event.target.value)
            }
        }))
    }

    function handleActiveUnitSelect(event: SelectChangeEvent): void {
        setRequiredTime(current => ({
            ...current,
            active: {
                ...current.active,
                unit: timeUnitsFrom(event.target.value)
            }
        }))
    }

    function handleSubmit(): void {
        setMode(DisplayMode.VIEW)
        onSubmit(requiredTime)
    }

    function handleCancel(): void {
        if (!isEmptyRequiredTime(props.requiredTime)) {
            setMode(DisplayMode.VIEW)
        }
        setRequiredTime(props.requiredTime)
        onCancel()
    }

    function canSubmit(): boolean {
        const {total, active} = requiredTime
        return total.value > 0 && total.unit !== null && active.value > 0 && active.unit !== null
    }

    if (mode === DisplayMode.VIEW && !isEmptyRequiredTime(requiredTime)) {
        return (
            <>
                <IconButton
                    onClick={() => setMode(DisplayMode.EDIT)}
                    color='primary'
                    size='small'
                >
                    <ModeEditIcon sx={{width: 18, height: 18}}/>
                </IconButton>
                <div>Total Time: {displayTime(requiredTime.total)}</div>
                <div>Active Time: {displayTime(requiredTime.active)}</div>
            </>
        )

    }

    return (
        <>
            <TextField
                id="recipe-required-time-total-value"
                label="Total Time"
                size='small'
                type="number"
                value={requiredTime.total.value}
                sx={{"& .MuiOutlinedInput-root": {width: 120}}}
                onChange={event => setRequiredTime(current => ({...current, total: {...current.total, value: parseFloat(event.target.value)}}))}
            />
            <Select
                id="recipe-required-time-total-unit"
                size='small'
                value={requiredTime.total.unit}
                onChange={handleTotalUnitSelect}
                sx={{mt: 1.2, mr: 0.5, minWidth: 100}}
            >
                {Object.entries(TimeUnits).map(([label, unit]) => (
                    <MenuItem key={unit} value={unit}>{label.toLowerCase()}</MenuItem>
                ))}
            </Select>
            <TextField
                id="recipe-required-time-active-value"
                label="Active Time"
                size='small'
                type="number"
                value={requiredTime.active.value}
                sx={{"& .MuiOutlinedInput-root": {width: 120}}}
                onChange={event => setRequiredTime(current => ({...current, active: {...current.active, value: parseFloat(event.target.value)}}))}
            />
            <Select
                id="recipe-required-time-active-unit"
                size='small'
                value={requiredTime.active.unit}
                onChange={handleActiveUnitSelect}
                sx={{mt: 1.2, mr: 0.5, minWidth: 100}}
            >
                {Object.entries(TimeUnits).map(([label, unit]) => (
                    <MenuItem key={unit} value={unit}>{label.toLowerCase()}</MenuItem>
                ))}
            </Select>
            <IconButton onClick={handleSubmit} color='primary' disabled={!canSubmit()}>
                <CheckBoxIcon/>
            </IconButton>
            <IconButton onClick={handleCancel} color='secondary' disabled={isEmptyRequiredTime(requiredTime)}>
                <CancelIcon/>
            </IconButton>
        </>
    )
}

function displayTime(time: Time): string {
    const {value, unit} = time
    if (value === 0 || unit === null) {
        return '[none]'
    }
    return `${value} ${unit}`
}