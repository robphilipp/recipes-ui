import pluralize from 'pluralize'
import formatQuantity from "format-quantity";
import {RequiredTime, Time, Units} from "../components/Recipe";

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
        return `${quantity}`
    }
    if (quantity === 0) {
        return `0 ${pluralize(units, 0)}`
    }
    const unit = units === Units.LITER ? 'ℓ' : units
    if (units === Units.MILLIGRAM || units === Units.GRAM || units === Units.KILOGRAM ||
        units === Units.MILLILITER || units === Units.LITER
    ) {
        return `${formatQuantity(quantity, true)} ${unit}`
    }
    return `${formatQuantity(quantity, true)} ${pluralize(unit, Math.max(1, quantity))}`
}
