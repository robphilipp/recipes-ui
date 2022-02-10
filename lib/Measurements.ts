import convert, {Force, Mass, Volume} from "convert";
import {failureResult, Result, successResult} from "./Result";

export enum UnitName {
    milligram = 'milligram',
    gram = 'gram',
    kilogram = 'kilogram',
    
    ounce = 'ounce',
    pound = 'pound',
    
    milliliter = 'milliliter',
    liter = 'liter',
    teaspoon = 'teaspoon',
    tablespoon = 'tablespoon',
    fluid_ounce = 'fluid once',
    cup = 'cup',
    pint = 'pint',
    quart = 'quart',
    gallon = 'gallon',

    piece = 'piece',
    pinch = 'pinch'
}

/**
 * Constructs a {@link Unit} from the unit and its human-readable label
 * @param unit The unit
 * @param label The human-readable label
 */
function unitFrom(unit: Units, label: UnitName): Unit {
    return {value: unit, label}
}

export function unitsFrom(unit: string): Units {
    const [, key] = Object.entries(Units).find(([, value]) => value === unit)
    return key
}

/**
 * The units for the ingredients
 */
export enum Units {
    MILLIGRAM = 'mg', GRAM = 'g', KILOGRAM = 'kg',
    OUNCE = 'oz', POUND = 'lb',
    MILLILITER = 'ml', LITER = 'l', TEASPOON = 'tsp', TABLESPOON = 'tbsp', FLUID_OUNCE = 'fl oz',
    CUP = 'cup', PINT = 'pt', QUART = 'qt', GALLON = 'gal',
    PIECE = 'piece', PINCH = 'pinch'
}

/**
 * The categories for the units used by the ingredients
 */
export enum UnitCategories {
    MASS = 'Mass',
    WEIGHT = 'Weight',
    VOLUME = 'Volume',
    PIECE = 'Piece'
}

/**
 * The unit name and its associated human-readable value
 */
export type Unit = {
    // the unit name
    value: string
    // the human-readable value
    // label: string
    label: UnitName
}

/**
 * The amount of the ingredient
 */
export type Amount = {
    value: number
    unit: Units
}

export function amountFor(value: number, unit: Units): Amount {
    return {value, unit}
}

/**
 * Map that holds the units that belong to each category. For example,
 * kg, mg are mass, and pounds, and ounces are weights, and liter
 * and gallon are volume, etc.
 */
export const unitsByCategory = new Map<UnitCategories, Array<Unit>>([
    [UnitCategories.MASS, [
        unitFrom(Units.MILLIGRAM, UnitName.milligram),
        unitFrom(Units.GRAM, UnitName.gram),
        unitFrom(Units.KILOGRAM, UnitName.kilogram)
    ]],
    [UnitCategories.WEIGHT, [
        unitFrom(Units.OUNCE, UnitName.ounce),
        unitFrom(Units.POUND, UnitName.pound)
    ]],
    [UnitCategories.VOLUME, [
        unitFrom(Units.MILLILITER, UnitName.milliliter),
        unitFrom(Units.LITER, UnitName.liter),
        unitFrom(Units.TEASPOON, UnitName.teaspoon),
        unitFrom(Units.TABLESPOON, UnitName.tablespoon),
        unitFrom(Units.FLUID_OUNCE, UnitName.fluid_ounce),
        unitFrom(Units.CUP, UnitName.cup),
        unitFrom(Units.PINT, UnitName.pint),
        unitFrom(Units.QUART, UnitName.quart),
        unitFrom(Units.GALLON, UnitName.gallon)
    ]],
    [UnitCategories.PIECE, [
        unitFrom(Units.PIECE, UnitName.piece),
        unitFrom(Units.PINCH, UnitName.pinch)
    ]]
])

export const measurementUnits = Array.from(unitsByCategory.values()).flat()

/**
 * Calculates the unit-category for each unit
 */
export const categoriesByUnits = new Map<Units, UnitCategories>(
    Array
        .from(unitsByCategory.entries())
        .flatMap(([category, units]) => units.map(unit => [unitsFrom(unit.value), category]))
)

type Conversions = 'mg' | 'g' | 'kg' |
    'ounce' | 'pounds' |
    'ml' | 'liter' | 'tsp' | 'tbsp' | 'cup' | 'fl oz' | 'pint' | 'quart' | 'gallon'
const conversionMap = new Map<Units, Conversions>([
    [Units.MILLIGRAM, 'mg'],
    [Units.GRAM, 'g'],
    [Units.KILOGRAM, 'kg'],

    [Units.OUNCE, 'ounce'],
    [Units.POUND, 'pounds'],

    [Units.MILLILITER, 'ml'],
    [Units.LITER, 'liter'],
    [Units.TEASPOON, 'tsp'],
    [Units.TABLESPOON, 'tbsp'],
    [Units.CUP, 'cup'],
    [Units.FLUID_OUNCE, 'fl oz'],
    [Units.PINT, 'pint'],
    [Units.QUART, 'quart'],
    [Units.GALLON, 'gallon']
])

/**
 * Attempts to convert the specified amount to the specified `toUnit`.
 * @param amount The amount to convert
 * @param toUnit The target units
 * @return A {@link Result} holding the converted {@link Amount} when successful. Otherwise,
 * a failure.
 */
export function convertAmount(amount: Amount, toUnit: Units): Result<Amount, string> {
    const fromUnits: Conversions = conversionMap.get(amount.unit)
    const toUnits: Conversions = conversionMap.get(toUnit)
    if (fromUnits && toUnits) {
        const category = categoriesByUnits.get(amount.unit)
        try {
            switch (category) {
                case UnitCategories.MASS:
                    return successResult({
                        value: convert(amount.value, fromUnits as Mass).to(toUnits as Mass),
                        unit: toUnit
                    })
                case UnitCategories.WEIGHT:
                    return successResult({
                        value: convert(amount.value, fromUnits as Force).to(toUnits as Force),
                        unit: toUnit
                    })
                case UnitCategories.VOLUME:
                    return successResult({
                        value: convert(amount.value, fromUnits as Volume).to(toUnits as Volume),
                        unit: toUnit
                    })
                default:
                    return successResult(amount)
            }
        } catch (reason) {
            return failureResult(reason)
        }
    }
}

/**
 * Currying function that accepts an {@link Amount} and returns a function that accepts the
 * target {@link Units} and returns the {@link Result} holding the {@link Amount} or a failure
 * @param amount The amount to convert
 * @return A function that accepts the target {@link Units} and returns the {@link Result} holding
 * the {@link Amount} or a failure
 */
export function convertFrom(amount: Amount): (unit: Units) => Result<Amount, string> {
    return unit => convertAmount(amount, unit)
}

/**
 * Currying function that accepts a target {@link Units} and returns a function that accepts the
 * {@link Amount} to convert and returns a {@link Result} that holds the converted {@link Amount}
 * or a failure
 * @param unit The target units
 * @return a function that accepts the {@link Amount} to convert and returns a {@link Result} that
 * holds the converted {@link Amount} or a failure
 */
export function convertTo(unit: Units): (amount: Amount) => Result<Amount, string> {
    return amount => convertAmount(amount, unit)
}