import {ObjectId} from "mongodb";

export type PasswordResetToken = {
    _id?: ObjectId
    userId: string
    resetToken: string
    expiration: number
}