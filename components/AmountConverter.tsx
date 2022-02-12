import {
    Amount,
    amountFor,
    categoriesByUnits,
    convertAmount,
    measurementUnits,
    Unit,
    UnitCategories,
    unitFor,
    UnitName,
    unitsByCategory,
    UnitType
} from '../lib/Measurements'
import {Autocomplete, Box, Stack, TextField} from "@mui/material";
import React, {SyntheticEvent, useState} from "react";
import formatQuantity from "format-quantity";
import {formatNumber} from "../lib/utils";

type UnitOption = { label: UnitName, value: UnitType }

export default function AmountConverter(): JSX.Element {

    const [fromAmount, setFromAmount] = useState<Amount>(amountFor(0, UnitType.TABLESPOON))
    const [toAmount, setToAmount] = useState<Amount>(amountFor(0, UnitType.TEASPOON))
    const [toOptions, setToOptions] = useState<Array<UnitOption>>(() => validToUnitsFor(unitOptionFrom(UnitName.tablespoon)))

    function handleSetFromUnit(unit: UnitOption): void {
        // calculate the valid units for the new fromAmount
        const validUnits = validToUnitsFor(unitOptionFrom(unit.label))

        setFromAmount(current => ({...current, unit: unit.value}))
        setToOptions(validUnits)

        // when the units we are converting into are no longer valid, then set them to the
        // same units as just selected
        if (validUnits.findIndex(option => option.value === toAmount.unit) < 0) {
            setToAmount(current => ({...current, unit: unit.value}))
        }
    }

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
                // options={measurementUnits.map(unit => ({label: unit.label, value: unit.value}))}
                options={measurementUnits.map(unit => unitOptionFor(unit))}
                groupBy={option => categoriesByUnits.get(option.value as UnitType)}
                sx={{mt: 1.2, mr: 0.5, minWidth: 150, maxWidth: 350}}
                size='small'
                value={fromAmount.unit}
                // @ts-ignore
                isOptionEqualToValue={(option, value) => option !== null && option.value === value}
                onChange={(event: SyntheticEvent, newValue: UnitOption) => handleSetFromUnit(newValue)}
                // onChange={(event: SyntheticEvent, newValue: UnitOption) => setFromAmount(current => ({
                //     ...current,
                //     unit: newValue.value
                // }))}
            />
        </Stack>
        <Stack direction="row" spacing={1} sx={{paddingTop: 1}}>
            <TextField
                id="conversion-to-amount-value"
                label="To Quantity"
                size='small'
                autoFocus={true}
                value={formatQuantity(formatNumber(toAmount.value) || '0', false)}
                disabled={true}
            />
            <Autocomplete
                id="conversion-amount-unit-select"
                renderInput={(params) => (<TextField {...params} label="units"/>)}
                // options={measurementUnits.map(unit => ({label: unit.label, value: unit.value}))}
                // options={measurementUnits.map(unit => unitOptionFor(unit))}
                options={toOptions}
                groupBy={option => categoriesByUnits.get(option.value as UnitType)}
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

function unitOptionFrom(unitName: UnitName): UnitOption {
    return unitOptionFor(unitFor(unitName))
}

function unitOptionFor(unit: Unit): UnitOption {
    return {label: unit.label, value: unit.value as UnitType}
}

function validToUnitsFor(unit: UnitOption): Array<UnitOption> {
    const categories: UnitCategories = categoriesByUnits.get(unit.value as UnitType)
    switch(categories) {
        case UnitCategories.MASS:
        case UnitCategories.WEIGHT: {
            const unitOptions: Array<UnitOption> = []
            unitOptions.push(...unitsByCategory.get(UnitCategories.MASS).map(unitOptionFor))
            unitOptions.push(...unitsByCategory.get(UnitCategories.WEIGHT).map(unitOptionFor))
            return unitOptions
        }
        default:
            return unitsByCategory.get(categories).map(unitOptionFor)

    }
}