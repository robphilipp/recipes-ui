import {
    Amount,
    amountFor,
    categoriesByUnits,
    convertAmount,
    measurementUnits,
    UnitName,
    Units
} from '../lib/Measurements'
import {Autocomplete, Box, Grid, Stack, TextField, Typography} from "@mui/material";
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
        <Stack direction="row" spacing={1} sx={{paddingTop: 1}}>
            <TextField
                id="conversion-amount-value"
                label="From Quantity"
                size='small'
                type="number"
                required
                autoFocus={true}
                value={fromAmount.value}
                onChange={event => setFromAmount(current => ({...current, value: parseFloat(event.target.value)}))}
            />
            <Autocomplete
                id="conversion-amount-unit-select"
                renderInput={(params) => (<TextField {...params} label="units"/>)}
                options={measurementUnits.map(unit => ({label: unit.label, value: unit.value}))}
                groupBy={option => categoriesByUnits.get(option.value as Units)}
                sx={{mt: 1.2, mr: 0.5, minWidth: 150, maxWidth: 350}}
                size='small'
                value={fromAmount.unit}
                // @ts-ignore
                isOptionEqualToValue={(option, value) => option !== null && option.value === value}
                onChange={(event: SyntheticEvent, newValue: UnitOption) => setFromAmount(current => ({
                    ...current,
                    unit: newValue.value
                }))}
            />
        </Stack>
        <Stack direction="row" spacing={1} sx={{paddingTop: 1}}>
            <TextField
                id="conversion-to-amount-value"
                label="To Quantity"
                size='small'
                // type="number"
                // required
                autoFocus={true}
                value={formatQuantity(formatNumber(toAmount.value) || '0', false)}
                disabled={true}
                // onChange={event => setFromAmount(current => ({...current, value: parseFloat(event.target.value)}))}
            />
            <Autocomplete
                id="conversion-amount-unit-select"
                renderInput={(params) => (<TextField {...params} label="units"/>)}
                options={measurementUnits.map(unit => ({label: unit.label, value: unit.value}))}
                groupBy={option => categoriesByUnits.get(option.value as Units)}
                sx={{mt: 1.2, mr: 0.5, minWidth: 150, maxWidth: 350}}
                size='small'
                value={toAmount.unit}
                // @ts-ignore
                isOptionEqualToValue={(option, value) => option !== null && option.value === value}
                onChange={(event: SyntheticEvent, newValue: UnitOption) => setToAmount(current => ({
                    ...current,
                    unit: newValue.value
                }))}
            />
        </Stack>
    </Box>

}