import {
    Amount,
    amountFor,
    categoriesByUnits,
    convertAmount,
    measurementUnits,
    UnitName,
    Units
} from '../lib/Measurements'
import {Autocomplete, Box, Grid, TextField, Typography} from "@mui/material";
import React, {SyntheticEvent, useState} from "react";
import formatQuantity from "format-quantity";
import {formatNumber} from "../lib/utils";

type UnitOption = { label: UnitName, value: Units }

export default function AmountConverter(): JSX.Element {

    const [fromAmount, setFromAmount] = useState<Amount>(amountFor(0, Units.TABLESPOON))
    const [toAmount, setToAmount] = useState<Amount>(amountFor(0, Units.TEASPOON))

    function handleKeyPress(event: React.KeyboardEvent<HTMLDivElement>): void {
        if (event.key === 'Enter') {
            convertAmount(fromAmount, toAmount.unit)
                .onSuccess(amount => setToAmount(current => ({...current, value: amount.value})))
        }
    }

    return <Box onKeyDown={handleKeyPress}>
        <Grid container sx={{
            maxWidth: {xs: 500, sm: 500, md: 800}
        }}>
            <Grid item xs={6} md={2} lg={2}>
                <TextField
                    id="conversion-amount-value"
                    label="Quantity"
                    size='small'
                    type="number"
                    required
                    autoFocus={false}
                    value={fromAmount.value}
                    onChange={event => setFromAmount(current => ({...current, value: parseFloat(event.target.value)}))}
                />
            </Grid>
            <Grid item xs={6} md={2} lg={2}>
                <Autocomplete
                    id="conversion-amount-unit-select"
                    renderInput={(params) => (<TextField {...params} label="units"/>)}
                    options={measurementUnits.map(unit => ({label: unit.label, value: unit.value}))}
                    groupBy={option => categoriesByUnits.get(option.value as Units)}
                    sx={{mt: 1.2, mr: 0.5, minWidth: 100, maxWidth: 150}}
                    size='small'
                    value={fromAmount.unit}
                    // @ts-ignore
                    isOptionEqualToValue={(option, value) => option !== null && option.value === value}
                    onChange={(event: SyntheticEvent, newValue: UnitOption) => setFromAmount(current => ({...current, unit: newValue.value}))}
                />
            </Grid>
            <Grid item xs={6} md={2} lg={2}>
                <Typography>
                    {formatQuantity(formatNumber(toAmount.value), true)}
                </Typography>
            </Grid>
            <Grid item xs={6} md={2} lg={2}>
                <Autocomplete
                    id="conversion-amount-unit-select"
                    renderInput={(params) => (<TextField {...params} label="units"/>)}
                    options={measurementUnits.map(unit => ({label: unit.label, value: unit.value}))}
                    groupBy={option => categoriesByUnits.get(option.value as Units)}
                    sx={{mt: 1.2, mr: 0.5, minWidth: 100, maxWidth: 150}}
                    size='small'
                    value={toAmount.unit}
                    // @ts-ignore
                    isOptionEqualToValue={(option, value) => option !== null && option.value === value}
                    onChange={(event: SyntheticEvent, newValue: UnitOption) => setToAmount(current => ({...current, unit: newValue.value}))}
                />
            </Grid>
        </Grid>
    </Box>

}