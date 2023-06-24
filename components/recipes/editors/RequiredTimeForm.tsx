import React, {useEffect, useState} from 'react'
import {RequiredTime, TimeUnits, timeUnitsFrom} from "../Recipe";
import {Box, IconButton, MenuItem, Select, SelectChangeEvent, TextField, Typography} from "@mui/material";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import {DisplayMode} from "./FormMode";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SaveIcon from '@mui/icons-material/Save';
import {formatQuantityFor} from "../../../lib/utils";

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

    useEffect(
        () => {
            setRequiredTime(props.requiredTime)
        },
        [props.requiredTime]
    )

    function handleTotalUnitSelect(event: SelectChangeEvent): void {
        timeUnitsFrom(event.target.value)
            .onSuccess(unit => setRequiredTime(current => ({
                ...current,
                total: {...current.total, unit}
            })))

    }

    function handleActiveUnitSelect(event: SelectChangeEvent): void {
        timeUnitsFrom(event.target.value)
            .onSuccess(unit => setRequiredTime(current => ({
                ...current,
                active: {...current.active, unit}
            })))
    }

    function handleSubmit(): void {
        setMode(DisplayMode.VIEW)
        onSubmit(requiredTime)
    }

    function handleCancel(): void {
        setMode(DisplayMode.VIEW)
        setRequiredTime(props.requiredTime)
        onCancel()
    }

    function handleKeyPress(event: React.KeyboardEvent<HTMLDivElement>): void {
        switch (event.key) {
            case 'Enter':
                if (canSubmit()) {
                    handleSubmit()
                }
                break
            case 'Escape':
                handleCancel()
                break
        }
    }

    function canSubmit(): boolean {
        const {total, active} = requiredTime
        return total.value > 0 && total.unit !== null && active.value > 0 && active.unit !== null
    }

    if (mode === DisplayMode.VIEW) {
        return (
            <Typography sx={{fontSize: '0.8em', fontWeight: 540, marginTop: 1}}>
                <AccessTimeIcon sx={{
                    width: 14,
                    height: 14
                }}/> {formatQuantityFor(requiredTime.total.value, requiredTime.total.unit)} total; {formatQuantityFor(requiredTime.active.value, requiredTime.active.unit)} active

                <IconButton
                    onClick={() => setMode(DisplayMode.EDIT)}
                    color='primary'
                    size='small'
                    sx={{marginBottom: 1}}
                >
                    <ModeEditIcon sx={{width: 18, height: 18}}/>
                </IconButton>
            </Typography>
        )
    }

    return (
        <Box onKeyDown={handleKeyPress}>
            <TextField
                id="recipe-required-time-total-value"
                label="Total"
                size='small'
                type="number"
                autoFocus={true}
                value={requiredTime.total.value}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        width: {xs: 75}
                    }
                }}
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
                label="Active"
                size='small'
                type="number"
                value={requiredTime.active.value}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        width: {xs: 75}
                    }
                }}
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
            <IconButton
                onClick={handleSubmit}
                color='primary'
                disabled={!canSubmit()}
            >
                <SaveIcon sx={{width: 18, height: 18}}/>
            </IconButton>
            <IconButton
                onClick={handleCancel}
                color='secondary'
            >
                <CancelIcon sx={{width: 18, height: 18}}/>
            </IconButton>
        </Box>
    )
}
