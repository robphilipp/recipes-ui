import pluralize from 'pluralize'
import formatQuantity from "format-quantity";

export function valueWithUnits(value: number, units?: string): string {
    if (units === undefined || units === '') {
        return `${value}`
    }
    return `${formatQuantity(value, true)} ${pluralize(units, Math.max(1, value))}`
}
