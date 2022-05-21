import pluralize from 'pluralize'
import formatQuantity from "format-quantity";
import {UnitType} from "./Measurements";

/**
 * Converts the quantity to a fraction and pluralizes the units for display.
 * @param quantity The quantity
 * @param units The units
 * @return A formatted quantity and units.
 * @example
 * 0.25 cups => 1/4 cup
 * 2 pint => 2 pints
 */
export function formatQuantityFor(quantity: number, units?: string): string {
    if (units === undefined || units === '') {
        return `${formatNumber(quantity)}`
    }
    if (Math.abs(quantity) <= 0.00001) {
        return `0 ${pluralize(units, 0)}`
    }
    const unit = units === UnitType.LITER ? 'ℓ' : units
    if (units === UnitType.MILLIGRAM || units === UnitType.GRAM || units === UnitType.KILOGRAM ||
        units === UnitType.MILLILITER || units === UnitType.LITER
    ) {
        return `${formatQuantity(formatNumber(quantity), true)} ${unit}`
    }
    return `${formatQuantity(formatNumber(quantity), true)} ${pluralize(unit, Math.max(1, quantity))}`
}

export function formatNumber(
    value: number,
    locale: string = 'en-US',
    options: Intl.NumberFormatOptions = {maximumSignificantDigits: 4}
): string {
    return new Intl.NumberFormat(locale, options).format(value)
}
