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
 * @param password
 * @param confirmPassword
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
    return (confirmPassword.length > 0) ? password === confirmPassword : true
}

export function passwordRequirementsFailed(password: string): Array<string> {
    return PASSWORD_REQUIREMENTS
        .filter(rule => !rule.meetsRequirement(password))
        .map(rule => rule.description)
}

export function passwordRequirementsResult(password: string): Array<PasswordRequirementResult> {
    return PASSWORD_REQUIREMENTS
        .map(rule => ({
            description: rule.description,
            met: rule.meetsRequirement(password)
        }))
}

export function initialPasswordRequirements(): Array<PasswordRequirementResult> {
    return PASSWORD_REQUIREMENTS
        .map(rule => ({
            description: rule.description,
            met: false
        }))
}
