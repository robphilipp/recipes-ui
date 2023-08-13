import {Long, ObjectId} from "mongodb";

export type PasswordResetToken = {
    _id?: ObjectId
    userId: string
    resetToken: string
    expiration: number
}

export const emptyToken = (): PasswordResetToken => ({
    userId: '',
    resetToken: '',
    expiration: -1
})