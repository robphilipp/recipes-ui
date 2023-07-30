export type PasswordResetToken = {
    userId: string
    resetToken: string
    expiration: number
}