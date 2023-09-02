/*
 * Constraint functions that returns an error message when the constraints are
 * not met, and an empty string if the constraints are met
 */

/**
 * String length constraint that returns an error message if the constraints are not met,
 * and returns an empty string if the constraints are met
 * @param name The field name associated with the value (used for the error message)
 * @param value The value associated with the field-name (used to check)
 * @param min The minimum length (inclusive)
 * @param max The maximum length (inclusive)
 * @return An error message if the length constraint is not met, otherwise an empty string
 */
export const stringLengthConstraint = (name: string, value: string, min: number = 6, max: number = 30): string =>
    (value.length > 0 && (value.length < min || value.length > max)) ?
        `length (${value.length}) of the ${name} must be between ${min} and ${max} characters` :
        ""

// default valid-email regex
const EMAIL_REGEX: RegExp = /^[a-zA-Z0-9]+([._+-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)$/

/**
 * Email pattern constraint that returns an error message if the constraint is not met,
 * and returns an empty string if the constraint is met
 * @param email The email to test
 * @param pattern The {@link RegExp} pattern
 * @return an error message if the constraint is not met, and returns an empty string if
 * the constraint is met
 */
export function emailFormatConstraint(email: string, pattern: RegExp = EMAIL_REGEX): string {
    const lengthMatch = email.length >= 6 && email.length <= 50
    const patternMatch = (email.match(pattern)?.length || -1) > 0
    return !lengthMatch || !patternMatch ?
        `must be a valid email address between 6 and 50 characters` :
        ""
}
