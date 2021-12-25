import pluralize from 'pluralize'
import formatQuantity from "format-quantity";

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
    return `${formatQuantity(quantity, true)} ${pluralize(units, Math.max(1, quantity))}`
}
