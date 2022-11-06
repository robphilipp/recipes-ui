import convert, {Force, Mass, Volume} from "convert";
import {failureResult, Result, resultFromAll, successResult} from "result-fn";

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
export function unitTypeFrom(shorthand: string): Result<UnitType, string> {
    const entry = Object.entries(UnitType).find(([, value]) => value === shorthand)
    if (entry) {
        return successResult(entry[1])
    }
    return failureResult(`Unable to find unit type for shorthand; shorthand: ${shorthand}`)
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
    [UnitName.pinch, UnitType.PINCH],
])

const unitTypeToName = new Map<UnitType, UnitName>([
    [UnitType.MILLIGRAM, UnitName.milligram],
    [UnitType.GRAM, UnitName.gram],
    [UnitType.KILOGRAM, UnitName.kilogram],

    [UnitType.OUNCE, UnitName.ounce],
    [UnitType.POUND, UnitName.pound],

    [UnitType.MILLILITER, UnitName.milliliter],
    [UnitType.LITER, UnitName.liter],
    [UnitType.TEASPOON, UnitName.teaspoon],
    [UnitType.TABLESPOON, UnitName.tablespoon],
    [UnitType.FLUID_OUNCE, UnitName.fluid_ounce],
    [UnitType.CUP, UnitName.cup],
    [UnitType.PINT, UnitName.pint],
    [UnitType.QUART, UnitName.quart],
    [UnitType.GALLON, UnitName.gallon],

    [UnitType.PIECE, UnitName.piece],
    [UnitType.PINCH, UnitName.pinch]
])

export function unitFromName(unitName: UnitName): Unit {
    // by construction, units.get(unitName) will never return an undefined
    // @ts-ignore
    return unitFrom(units.get(unitName), unitName)
}

export function unitFromType(unitType: UnitType): Unit {
    return unitFromName(unitNameFor(unitType))
}

export function unitNameFor(unitType: UnitType): UnitName {
    // by construction, unitTypeToName.get(unitType) will never return an undefined
    // @ts-ignore
    return unitTypeToName.get(unitType)
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
// export const unitsByCategory = new Map<UnitCategories, Array<Unit>>([
const unitsByCategory = new Map<UnitCategories, Array<Unit>>([
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

export function unitsForCategory(unitCategories: UnitCategories): Result<Array<Unit>, string> {
    const units = unitsByCategory.get(unitCategories)
    if (units !== undefined) {
        return successResult(units)
    }
    return failureResult(`No units found for category; category: ${unitCategories}`)
}

export const measurementUnits = Array.from(unitsByCategory.values()).flat()

/**
 * Calculates the unit-category for each unit and ensures that the code is properly configured.
 * If the categories and units are properly configured, then unwrap the result, and that can
 * be used in the functions that follow this code.
 */
const categoriesByUnitsResult: Result<Map<UnitType, UnitCategories>, string> =
    resultFromAll<[UnitType, UnitCategories], string>(
        Array
            .from(unitsByCategory.entries())
            .flatMap(
                ([category, units]) => units
                    .map(unit => unitTypeFrom(unit.value).map(unitType => [unitType, category]))
            )
    )
        .map(items => new Map<UnitType, UnitCategories>(items))

if (categoriesByUnitsResult.failed) {
    const results = Array
        .from(unitsByCategory.entries())
        .flatMap(([category, units]) => units.map(unit => [unitTypeFrom(unit.value), category]))
        .filter(([result, ]: [Result<UnitType, string>, UnitCategories]) => result.failed)
        .map(([result, category]: [Result<UnitType, string>, UnitCategories]) => `[${result.error}, ${category}]`)

    throw Error(
        `Measurement setup failed. This is a logic/configuration error; ` +
        `${results.map(error => `${error}\n`)}`
    )
}

const categoriesByUnits: Map<UnitType, UnitCategories> = categoriesByUnitsResult.getOrDefault(new Map())

/**
 * Returns the {@link UnitCategories} for the specified {@link UnitType}
 * @param unitType The unit type (i.e. mg, pinch, gallon)
 * @return A {@link Result} holding the {@link UnitCategories} for the specified
 * {@link UnitType} or a failure.
 */
export function categoriesForUnit(unitType: UnitType): Result<UnitCategories, string> {
    const category = categoriesByUnits.get(unitType)
    if (category !== undefined) {
        return successResult(category)
    }
    return failureResult(`No unit categories found for unit type; unit_type: ${unitType}`)
}

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
    const fromUnits = conversionMap.get(amount.unit)
    if (fromUnits === undefined) {
        return failureResult(
            `Cannot find conversion for the amount's units to convert from; units: ${amount.unit}`
        )
    }
    const toUnits = conversionMap.get(toUnit)
    if (toUnits === undefined) {
        return failureResult(
            `Cannot find conversion for the units to convert to; units: ${toUnit}`
        )
    }
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