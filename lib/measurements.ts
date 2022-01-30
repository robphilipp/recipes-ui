import {Amount, Unit, UnitCategories, Units, unitsFrom} from "../components/Recipe";
import convert, {Force, Mass, Volume} from "convert";
import {failureResult, Result, successResult} from "./Result";

export enum UnitName {
    milligram = 'milligram',
    gram = 'gram',
    kilogram = 'kilogram',
    
    ounce = 'once',
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

// const measurementMap = new Map(measurementUnits.map(unit => [unit.value, unit.label]))

/**
 * Calculates the unit-category for each unit
 */
export const categoriesByUnits = new Map<Units, UnitCategories>(
    Array.from(unitsByCategory.entries())
        .flatMap(([category, units]) => units.map(unit => [unitsFrom(unit.value), category]))
)


// function category(unit: Units): Mass | Force |
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

export function convertAmount(amount: Amount, toUnit: Units): Result<Amount, string> {
    const fromUnits: Conversions = conversionMap.get(amount.unit)
    const toUnits: Conversions = conversionMap.get(toUnit)
    if (fromUnits && toUnits) {
        const category = categoriesByUnits.get(amount.unit)
        let value: number
        try {
            switch (category) {
                case UnitCategories.MASS:
                    value = convert(amount.value, fromUnits as Mass).to(toUnits as Mass)
                    break
                case UnitCategories.WEIGHT:
                    value = convert(amount.value, fromUnits as Force).to(toUnits as Force)
                    break
                case UnitCategories.VOLUME:
                    value = convert(amount.value, fromUnits as Volume).to(toUnits as Volume)
                    break
                default:
                    value = amount.value
            }
            return successResult({value, unit: toUnit})
        } catch (reason) {
            return failureResult(reason)
        }
    }
}

export function convertFrom(amount: Amount): (unit: Units) => Result<Amount, string> {
    return unit => convertAmount(amount, unit)
}

export function convertTo(unit: Units): (amount: Amount) => Result<Amount, string> {
    return amount => convertAmount(amount, unit)
}