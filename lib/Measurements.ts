import convert, {Force, Mass, Volume} from "convert";
import {failureResult, Result, successResult} from "result-fn";

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
function unitFrom(unit: UnitType, label: UnitName): Unit {
    return {value: unit, label}
}

/**
 * Returns the {@link UnitType} associated with the shorthand (e.g. mg, g, oz, etc)
 * @param shorthand the shorthand (e.g. mg, g, oz, etc)
 * @return The {@link UnitType} associated with the shorthand
 */
export function unitTypeFrom(shorthand: string): UnitType {
    const [, key] = Object.entries(UnitType).find(([, value]) => value === shorthand)
    return key
}

/**
 * The units for the ingredients
 */
export enum UnitType {
    MILLIGRAM = 'mg', GRAM = 'g', KILOGRAM = 'kg',
    OUNCE = 'oz', POUND = 'lb',
    MILLILITER = 'ml', LITER = 'l', TEASPOON = 'tsp', TABLESPOON = 'tbsp', FLUID_OUNCE = 'fl oz',
    CUP = 'cup', PINT = 'pt', QUART = 'qt', GALLON = 'gal',
    PIECE = 'piece', PINCH = 'pinch'
}

const units = new Map<UnitName, UnitType>([
    [UnitName.milligram, UnitType.MILLIGRAM],
    [UnitName.gram, UnitType.GRAM],
    [UnitName.kilogram, UnitType.KILOGRAM],

    [UnitName.ounce, UnitType.OUNCE],
    [UnitName.pound, UnitType.POUND],

    [UnitName.milliliter, UnitType.MILLILITER],
    [UnitName.liter, UnitType.LITER],
    [UnitName.teaspoon, UnitType.TEASPOON],
    [UnitName.tablespoon, UnitType.TABLESPOON],
    [UnitName.fluid_ounce, UnitType.FLUID_OUNCE],
    [UnitName.cup, UnitType.CUP],
    [UnitName.pint, UnitType.PINT],
    [UnitName.quart, UnitType.QUART],
    [UnitName.gallon, UnitType.GALLON],

    [UnitName.piece, UnitType.PIECE],
    [UnitName.pint, UnitType.PINCH],
])

export function unitFor(unitName: UnitName): Unit {
    return unitFrom(units.get(unitName), unitName)
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
    value: UnitType
    // value: string
    // the human-readable value
    label: UnitName
}

/**
 * The amount of the ingredient
 */
export type Amount = {
    value: number
    unit: UnitType
}

export function amountFor(value: number, unit: UnitType): Amount {
    return {value, unit}
}

/**
 * Map that holds the units that belong to each category. For example,
 * kg, mg are mass, and pounds, and ounces are weights, and liter
 * and gallon are volume, etc.
 */
export const unitsByCategory = new Map<UnitCategories, Array<Unit>>([
    [UnitCategories.MASS, [
        unitFrom(UnitType.MILLIGRAM, UnitName.milligram),
        unitFrom(UnitType.GRAM, UnitName.gram),
        unitFrom(UnitType.KILOGRAM, UnitName.kilogram)
    ]],
    [UnitCategories.WEIGHT, [
        unitFrom(UnitType.OUNCE, UnitName.ounce),
        unitFrom(UnitType.POUND, UnitName.pound)
    ]],
    [UnitCategories.VOLUME, [
        unitFrom(UnitType.MILLILITER, UnitName.milliliter),
        unitFrom(UnitType.LITER, UnitName.liter),
        unitFrom(UnitType.TEASPOON, UnitName.teaspoon),
        unitFrom(UnitType.TABLESPOON, UnitName.tablespoon),
        unitFrom(UnitType.FLUID_OUNCE, UnitName.fluid_ounce),
        unitFrom(UnitType.CUP, UnitName.cup),
        unitFrom(UnitType.PINT, UnitName.pint),
        unitFrom(UnitType.QUART, UnitName.quart),
        unitFrom(UnitType.GALLON, UnitName.gallon)
    ]],
    [UnitCategories.PIECE, [
        unitFrom(UnitType.PIECE, UnitName.piece),
        unitFrom(UnitType.PINCH, UnitName.pinch)
    ]]
])

export const measurementUnits = Array.from(unitsByCategory.values()).flat()

/**
 * Calculates the unit-category for each unit
 */
export const categoriesByUnits = new Map<UnitType, UnitCategories>(
    Array
        .from(unitsByCategory.entries())
        .flatMap(([category, units]) => units.map(unit => [unitTypeFrom(unit.value), category]))
)

type Conversions = 'mg' | 'g' | 'kg' |
    'ounce' | 'pounds' |
    'ml' | 'liter' | 'tsp' | 'tbsp' | 'cup' | 'fl oz' | 'pint' | 'quart' | 'gallon'
const conversionMap = new Map<UnitType, Conversions>([
    [UnitType.MILLIGRAM, 'mg'],
    [UnitType.GRAM, 'g'],
    [UnitType.KILOGRAM, 'kg'],

    [UnitType.OUNCE, 'ounce'],
    [UnitType.POUND, 'pounds'],

    [UnitType.MILLILITER, 'ml'],
    [UnitType.LITER, 'liter'],
    [UnitType.TEASPOON, 'tsp'],
    [UnitType.TABLESPOON, 'tbsp'],
    [UnitType.CUP, 'cup'],
    [UnitType.FLUID_OUNCE, 'fl oz'],
    [UnitType.PINT, 'pint'],
    [UnitType.QUART, 'quart'],
    [UnitType.GALLON, 'gallon']
])

/**
 * Attempts to convert the specified amount to the specified `toUnit`.
 * @param amount The amount to convert
 * @param toUnit The target units
 * @return A {@link Result} holding the converted {@link Amount} when successful. Otherwise,
 * a failure.
 */
export function convertAmount(amount: Amount, toUnit: UnitType): Result<Amount, string> {
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
 * target {@link UnitType} and returns the {@link Result} holding the {@link Amount} or a failure
 * @param amount The amount to convert
 * @return A function that accepts the target {@link UnitType} and returns the {@link Result} holding
 * the {@link Amount} or a failure
 */
export function convertFrom(amount: Amount): (unit: UnitType) => Result<Amount, string> {
    return unit => convertAmount(amount, unit)
}

/**
 * Currying function that accepts a target {@link UnitType} and returns a function that accepts the
 * {@link Amount} to convert and returns a {@link Result} that holds the converted {@link Amount}
 * or a failure
 * @param unit The target units
 * @return a function that accepts the {@link Amount} to convert and returns a {@link Result} that
 * holds the converted {@link Amount} or a failure
 */
export function convertTo(unit: UnitType): (amount: Amount) => Result<Amount, string> {
    return amount => convertAmount(amount, unit)
}