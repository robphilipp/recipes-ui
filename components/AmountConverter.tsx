import {
    Amount,
    amountFor,
    categoriesForUnit,
    convertAmount,
    measurementUnits,
    Unit,
    UnitCategories,
    unitFromName,
    unitFromType,
    UnitName, unitsForCategory,
    UnitType
} from '../lib/Measurements'
import {Autocomplete, Box, Stack, TextField} from "@mui/material";
import React, {SyntheticEvent, useState, JSX} from "react";
import {formatNumber} from "../lib/utils";

type UnitOption = { label: UnitName, value: UnitType }
type Conversion = { from: Amount, to: Amount }
const initialConversion: Conversion = {
    from: amountFor(0, UnitType.TABLESPOON),
    to: amountFor(0, UnitType.TEASPOON)
}

export default function AmountConverter(): JSX.Element {

    const [conversion, setConversion] = useState<Conversion>(initialConversion)
    const [toOptions, setToOptions] = useState<Array<UnitOption>>(() => validToUnitsFor(unitOptionFrom(UnitName.tablespoon)))

    function handleSetFromUnit(unit: UnitOption): void {
        // calculate the valid units for the new fromAmount
        const validUnits = validToUnitsFor(unitOptionFrom(unit.label))

        setConversion(current => {
            if (validUnits.findIndex(option => option.value === current.to.unit) < 0) {
                return {
                    from: {...current.from, unit: unit.value},
                    to: {...current.from, unit: unit.value}
                }
            } else {
                const amount: Amount = {...current.from, unit: unit.value}
                return {
                    from: amount,
                    to: convertAmount(amount, current.to.unit).getOrDefault(current.from)
                }
            }
        })
        setToOptions(validUnits)
    }

    function handleSetToUnit(unit: UnitOption): void {
        convertAmount(conversion.from, unit.value)
            .onSuccess(amount => setConversion(current => ({
                from: current.from,
                to: amount
            })))
    }

    function handleKeyPress(event: React.KeyboardEvent<HTMLDivElement>): void {
        if (event.key === 'Enter' || event.key === 'Tab') {
            convertAmount(conversion.from, conversion.to.unit)
                .onSuccess(amount => setConversion(current => ({
                        ...current,
                        to: {...current.to, value: amount.value}
                    })
                ))
        }
    }

    return <Box onKeyDown={handleKeyPress}>
        <Stack direction="row" spacing={1} sx={{paddingTop: 1}}>
            <TextField
                id="conversion-from-amount-value"
                label="From Quantity"
                size='small'
                type="number"
                required
                autoFocus={true}
                value={conversion.from.value}
                // InputProps={{ inputProps: { min: 0, max: 10 } }}
                onChange={event => {
                    setConversion(current => {
                        const amount: Amount = {...current.from, value: parseFloat(event.target.value)}
                        return {
                            from: amount,
                            to: convertAmount(amount, current.to.unit).getOrDefault(amount)
                        }
                    })
                }}
            />
            <Autocomplete
                id="conversion-from-amount-unit-select"
                renderInput={(params) => (<TextField {...params} label="units"/>)}
                options={measurementUnits.map(unit => unitOptionFor(unit))}
                groupBy={option => categoriesForUnit(option.value as UnitType).getOrDefault(UnitCategories.PIECE)}
                // groupBy={option => categoriesByUnits.get(option.value as UnitType)}
                sx={{mt: 1.2, mr: 0.5, minWidth: 200, maxWidth: 450}}
                size='small'
                value={unitOptionFor(unitFromType(conversion.from.unit))}
                isOptionEqualToValue={(option, value) => option !== null && option.value === value.value}
                onChange={(event: SyntheticEvent, newValue: UnitOption) => handleSetFromUnit(newValue)}
                disableClearable={true}
            />
        </Stack>
        <Stack direction="row" spacing={1} sx={{paddingTop: 1}}>
            <TextField
                id="conversion-to-amount-value"
                label="To Quantity"
                size='small'
                autoFocus={true}
                value={formatNumber(conversion.to.value) || '0'}
                disabled={true}
            />
            <Autocomplete
                id="conversion-to-amount-unit-select"
                renderInput={(params) => (<TextField {...params} label="units"/>)}
                options={toOptions}
                groupBy={option => categoriesForUnit(option.value as UnitType).getOrDefault(UnitCategories.PIECE)}
                sx={{mt: 1.2, mr: 0.5, minWidth: 200, maxWidth: 450}}
                size='small'
                value={unitOptionFor(unitFromType(conversion.to.unit))}
                isOptionEqualToValue={(option, value) => option !== null && option.value === value.value}
                onChange={(event: SyntheticEvent, newValue: UnitOption) => handleSetToUnit(newValue)}
                disableClearable={true}
            />
        </Stack>
    </Box>
}

function unitOptionFrom(unitName: UnitName): UnitOption {
    return unitOptionFor(unitFromName(unitName))
}

function unitOptionFor(unit: Unit): UnitOption {
    return {label: unit.label, value: unit.value as UnitType}
}

function validToUnitsFor(unit: UnitOption): Array<UnitOption> {
    return categoriesForUnit(unit.value as UnitType)
        .map(categories => {
            switch (categories) {
                case UnitCategories.MASS:
                case UnitCategories.WEIGHT: {
                    const unitOptions: Array<UnitOption> = []
                    unitOptions.push(...unitsForCategory(UnitCategories.MASS).getOrDefault([]).map(unitOptionFor))
                    unitOptions.push(...unitsForCategory(UnitCategories.WEIGHT).getOrDefault([]).map(unitOptionFor))
                    return unitOptions
                }
                default:
                    return unitsForCategory(categories).getOrDefault([]).map(unitOptionFor)

            }}
        )
        .getOrDefault([])
}
