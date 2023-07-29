type PasswordRequirement = {
    description: string
    meetsRequirement: (password: string) => boolean
}

type PasswordRequirementResult = {
    description: string
    met: boolean
}

// requirements for the password
const PASSWORD_REQUIREMENTS: Array<PasswordRequirement> = [
    {
        description: 'be at least 8 characters long',
        meetsRequirement: (password: string) => password.length >= 8
    },
    {
        description: 'have uppercase characters',
        meetsRequirement: (password: string) => password.toLowerCase() !== password
    },
    {
        description: 'have lowercase characters',
        meetsRequirement: (password: string) => password.toUpperCase() !== password
    },
    {
        description: 'have numbers',
        meetsRequirement: (password: string) => (password.match(/^.*[0-9]+.*$/)?.length ?? 0) > 0
    }
]

/**
 * Calculates if the passwords match. The passwords match if the confirmation password
 * is empty
 * @param password The password
 * @param confirmPassword The confirmation password
 * @return `true` if the passwords match; `false` otherwise
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
    return (confirmPassword.length > 0) ? password === confirmPassword : true
}


/**
 * Calculates which rules/requirements the passwords meets
 * @param password The password
 * @return An array holding the descriptions and results
 */
export function passwordRequirementsResult(password: string): Array<PasswordRequirementResult> {
    return PASSWORD_REQUIREMENTS
        .map(rule => ({
            description: rule.description,
            met: rule.meetsRequirement(password)
        }))
}

/**
 * @return An array holding results that all the passwords failed
 */
export function initialPasswordRequirements(): Array<PasswordRequirementResult> {
    return PASSWORD_REQUIREMENTS
        .map(rule => ({
            description: rule.description,
            met: false
        }))
}
