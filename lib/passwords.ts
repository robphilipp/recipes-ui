import bcrypt from "bcrypt"
import {DateTime} from "luxon";
import {Collection, Long, MongoClient, ObjectId} from "mongodb";
import clientPromise from "./mongodb";
import {PasswordResetToken} from "../components/passwords/PasswordResetToken";

const SALT_ROUNDS: number = 10

const LETTERS_LOWER: string = "abcdefghijklmnopqrstuvwxyz"
const LETTERS_UPPER: string = LETTERS_LOWER.toUpperCase()
const NUMBERS: string = "0123456789"
const SPECIALS: string = "-_.#$^%&*"
const CHARACTERS: string = LETTERS_LOWER + LETTERS_UPPER + NUMBERS + SPECIALS
const NUM_CHARS: number = CHARACTERS.length
const ROUTE_HASH_CHARS: string = LETTERS_LOWER + LETTERS_UPPER + NUMBERS
const PASSWORD_RESET_TOKEN_EXPIRATION_DAYS: number = 7

if (process.env.mongoDatabase === undefined) {
    throw Error("mongoDatabase not specified in process.env")
}
if (process.env.passwordResetTokenCollection === undefined) {
    throw Error("passwordResetTokenCollection not specified in process.env")
}

const MONGO_DATABASE: string = process.env.mongoDatabase
const PASSWORD_RESET_TOKEN_COLLECTION: string = process.env.passwordResetTokenCollection

function passwordResetTokenCollection(client: MongoClient): Collection<MongoPasswordResetToken> {
    return client.db(MONGO_DATABASE).collection(PASSWORD_RESET_TOKEN_COLLECTION)
}

type MongoPasswordResetToken = {
    _id?: ObjectId
    userId: string
    resetToken: string
    expiration: Long
}

const emptyToken = (): MongoPasswordResetToken => ({
    userId: '',
    resetToken: '',
    expiration: Long.fromNumber(-1)
})

function convertToPasswordResetToken(mongoToken: MongoPasswordResetToken): PasswordResetToken {
    return ({
        _id: mongoToken._id,
        userId: mongoToken.userId,
        resetToken: mongoToken.resetToken,
        // this shouldn't be needed but for some reason mongo returns a number in some cases,
        // and a mongo Long in others
        expiration: typeof mongoToken.expiration === "number" ? mongoToken.expiration : mongoToken.expiration.toNumber()
        // expiration: mongoToken.expiration.toNumber()
    })
}

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS)
}

export function randomPassword(length: number = 12): string {
    return randomString(length, CHARACTERS)
}

export function passwordResetToken(length: number = 40): string {
    return randomString(length, ROUTE_HASH_CHARS)
}

function randomString(length: number, characters: string): string {
    let password = ""
    for(let i = 0; i < length; ++i) {
        password = password + characters.charAt(Math.random() * (NUM_CHARS-1))
    }
    return password
}

/**
 * Attempts to return the password reset token for the user. A user may have several
 * password reset tokens. For example, if the admin resent it again, or several times.
 * @param userId The ID of the user (not the {@link ObjectId})
 * @return A promise to an array of password reset tokens for the user.
 */
export async function tokensFor(userId: string): Promise<Array<PasswordResetToken>> {
    try {
        const client = await clientPromise
        const mongoTokens = await passwordResetTokenCollection(client)
            .find({userId: {$eq: userId}})
            .toArray()
        return mongoTokens.map(convertToPasswordResetToken)
    } catch (e) {
        console.error(`Unable to retrieve password reset tokens for user; user_id: ${userId}`, e)
        return Promise.reject(`Unable to retrieve password reset tokens for user; user_id: ${userId}`)
    }
}

/**
 * Attempts to retrieve all password tokens whose expiration date falls after the
 * end of today (UTC, end-of-day for when function is called).
 * @return A promise for an array of expired password tokens
 */
export async function retrieveExpiredTokens(): Promise<Array<PasswordResetToken>> {
    try {
        const client = await clientPromise
        const now = Long.fromNumber(DateTime.utc().endOf('day').toMillis())
        const mongoTokens = await passwordResetTokenCollection(client)
            .find({expiration: {$lt: now}})
            .toArray()
        return mongoTokens.map(convertToPasswordResetToken)
    } catch (e) {
        console.error("Unable to find expired password reset tokens", e)
        return Promise.reject("Unable to find expired password reset tokens")
    }
}

export type PasswordResetTokenPurgeResult = {
    purgedExpiredTokens: Array<PasswordResetToken>
    remainingExpiredTokens: Array<PasswordResetToken>
}

/**
 * Attempts to purge all expired password reset tokens. An expired password reset
 * token is one whose expiration date falls after the end of today (UTC, end-of-day
 * for when function is called).
 * @return A promise to an result of purge. Note that it is possible that not all
 * expired tokens were purge (as reported by {@link retrieveExpiredTokens}).
 * In this case, the {@link PasswordResetTokenPurgeResult.purgedExpiredTokens} will
 * not be empty.
 */
export async function purgeExpiredTokens(): Promise<PasswordResetTokenPurgeResult> {
    const expiredTokens= await retrieveExpiredTokens()
    if (expiredTokens.length === 0) {
        return {purgedExpiredTokens: [], remainingExpiredTokens: []}
    }
    try {
        const client = await clientPromise
        const expiredTokenIds = expiredTokens.map(token => token._id)
        const result = await passwordResetTokenCollection(client).deleteMany({_id: expiredTokenIds})
        if (result.acknowledged) {
            // all password reset tokens were deleted
            if (result.deletedCount === expiredTokenIds.length) {
                return {
                    purgedExpiredTokens: expiredTokens,
                    remainingExpiredTokens: []
                }
            }
            // some password tokens were deleted, so return only the deleted ones
            const stillExpiredTokens = await retrieveExpiredTokens()
            const purgedTokens = expiredTokens.filter(
                token => stillExpiredTokens.findIndex(tok => tok._id === token._id) >= 0
            )
            return {
                purgedExpiredTokens: purgedTokens,
                remainingExpiredTokens: stillExpiredTokens
            }
        }
        return Promise.reject("Unable to purge expired tokens (not acknowledged)")
    } catch (e) {
        console.error("Unable to purge expired tokens", e)
        return Promise.reject("Unable to purge expired tokens (error)")
    }
}

/**
 * Attempts to add a password reset token to the database for the specified user.
 * @param userId The ID of the user (string value, not the {@link ObjectId}.
 * @param expiresInDays Optional expiration (in days) which defaults to {@link PASSWORD_RESET_TOKEN_EXPIRATION_DAYS}
 * @return A promise to the added password reset token
 */
export async function addPasswordResetTokenFor(
    userId: string,
    expiresInDays: number = PASSWORD_RESET_TOKEN_EXPIRATION_DAYS
): Promise<PasswordResetToken> {
    const expirationMillis = DateTime.utc().plus({days: expiresInDays > 1 ? expiresInDays : PASSWORD_RESET_TOKEN_EXPIRATION_DAYS}).toMillis()
    const resetToken: MongoPasswordResetToken = {
        userId,
        resetToken: passwordResetToken(),
        expiration: Long.fromNumber(expirationMillis)
    }
    try {
        const client = await clientPromise
        const result = await passwordResetTokenCollection(client)
            .insertOne(resetToken)
        if (result.insertedId === undefined || result.insertedId === null) {
            return Promise.reject(`Unable to add password reset token for user: user_id: ${userId}`)
        }
        return convertToPasswordResetToken(resetToken)
    } catch (e) {
        console.error(`Unable to add password reset token for user: user_id: ${userId}`, e)
        return Promise.reject(`Unable to add password reset token for user: user_id: ${userId}`)
    }
}
