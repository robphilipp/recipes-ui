import clientPromise from "./mongodb"
import {ClientSession, Collection, Filter, FindOptions, Long, MongoClient, ObjectId} from "mongodb"
import {RecipesUser} from "../components/users/RecipesUser";
import {addUsersRolesMappingFor} from "./roles";
import {NewPassword} from "../pages/api/passwords/[id]";
import {emptyToken, PasswordResetToken} from "../components/passwords/PasswordResetToken";
import {DateTime} from "luxon";
import {addPasswordResetTokenFor, hashPassword, randomPassword} from "./passwords";

if (process.env.mongoDatabase === undefined) {
    throw Error("mongoDatabase not specified in process.env")
}
if (process.env.usersCollection === undefined) {
    throw Error("usersCollection not specified in process.env")
}
if (process.env.usersView === undefined) {
    throw Error("usersView not specified in process.env")
}
if (process.env.passwordResetTokenCollection === undefined) {
    throw Error("passwordResetToken not specified in process.env")
}

const MONGO_DATABASE: string = process.env.mongoDatabase
const USERS_COLLECTION: string = process.env.usersCollection

const PASSWORD_RESET_TOKEN_COLLECTION: string = process.env.passwordResetTokenCollection

function usersCollection(client: MongoClient): Collection<RecipesUser> {
    return client.db(MONGO_DATABASE).collection(USERS_COLLECTION)
}

function passwordResetTokenCollection(client: MongoClient): Collection<PasswordResetToken> {
    return client.db(MONGO_DATABASE).collection(PASSWORD_RESET_TOKEN_COLLECTION)
}

export async function usersCount(): Promise<number> {
    try {
        const client: MongoClient = await clientPromise
        return await usersCollection(client).countDocuments()
    } catch (e) {
        console.error("Unable to retrieve user count", e)
        return Promise.reject("Unable to retrieve user count")
    }
}

// type UsersCursor = {
//     readonly users: Array<RecipesUser>
//     readonly next: (n: number) => Promise<UsersCursor>
//     readonly rewind: () => Promise<UsersCursor>
//     readonly hasMore: boolean
// }
//
// async function rewindUsers(n: number, cursor: FindCursor<WithId<RecipesUser>>): Promise<UsersCursor> {
//     cursor.rewind()
//     return nextUsers(n, cursor)
// }
//
// async function nextUsers(n: number, cursor: FindCursor<WithId<RecipesUser>>): Promise<UsersCursor> {
//     const nextN: Array<RecipesUser> = []
//     let index = 0
//     while (await cursor.hasNext() && index < n) {
//         const user = await cursor.next()
//         index++
//         if (user !== null) {
//             nextN.push(user)
//         }
//     }
//     return {
//         users: nextN,
//         next: (n: number) => nextUsers(n, cursor),
//         rewind: () => rewindUsers(n, cursor),
//         hasMore: await cursor.hasNext(),
//     }
// }
//
// async function usersCursor(filter: Filter<RecipesUser> = {}, options?: FindOptions): Promise<FindCursor<WithId<RecipesUser>>> {
//     try {
//         const client: MongoClient = await clientPromise
//         return await usersCollection(client).find(filter, options)
//     } catch (e) {
//         console.log("Unable to retrieve users cursor", e)
//         return Promise.reject("Unable to retrieve users cursor")
//     }
// }
//
// export async function allUsers(filter: Filter<RecipesUser> = {}, options?: FindOptions): Promise<Array<RecipesUser>> {
//     try {
//         const cursor = await usersCursor(filter, options)
//         return cursor.toArray()
//     } catch (e) {
//         console.log("Unable to retrieve all users; filter: ", filter, "; options: ", options, e)
//         return Promise.reject("Unable to retrieve all users")
//     }
// }
//
// /**
//  * Returns a {@link UsersCursor} holding the users, a next function, a rewind function, and whether
//  * there are more users. This wraps the mongodb {@link FindCursor} in a more convenient way.
//  *
//  * @example
//  * let usersCursor = users(25)
//  * const users1: Array<RecipeUser> = usersCursor.users
//  * usersCursor = usersCursor.next(25)
//  * const users2: Array<RecipeUser> = usersCursor.users
//  * usersCursor = usersCursor.rewind()
//  * const users1again: Array<RecipeUser> = usersCursor.users
//  *
//  * @param batchSize The maximum number of users to retrieve in each batch
//  * @param filter An optional mongodb find filter
//  * @param options Optional mongodb find options (for sorting and the like)
//  * @return A {@link Promise} holding a {@link UsersCursor}
//  */
// export async function users(batchSize: number, filter: Filter<RecipesUser> = {}, options?: FindOptions): Promise<UsersCursor> {
//     try {
//         const cursor = await usersCursor(filter, options)
//         return await nextUsers(batchSize, cursor)
//     } catch (e) {
//         console.log(`Unable to retrieve users; batch_size: ${batchSize}; filter: `, filter, "; options: ", options, e)
//         return Promise.reject(`Unable to retrieve users; batch_size: ${batchSize}`)
//     }
// }

export async function users(filter: Filter<RecipesUser> = {}, options?: FindOptions): Promise<Array<RecipesUser>> {
    try {
        const client: MongoClient = await clientPromise
        return await usersCollection(client).find(filter).toArray()
    } catch (e) {
        console.error("Unable to retrieve users", e)
        return Promise.reject("Unable to retrieve users")
    }
}

export async function userByEmail(email: string): Promise<RecipesUser> {
    try {
        const client: MongoClient = await clientPromise
        const user = await usersCollection(client).findOne({email: email})
        if (user === null) {
            console.log(`Unable to retrieve user: email: ${email}`)
            return Promise.reject(`Unable to retrieve user: email: ${email}`)
        }
        return user
    } catch(e) {
        console.log(`Unable to retrieve user: email: ${email}`, e)
        return Promise.reject(`Unable to retrieve user: email: ${email}`)
    }
}

export type AddedUserInfo = {
    user: RecipesUser
    resetToken: PasswordResetToken
}

export async function addUser(user: RecipesUser): Promise<AddedUserInfo> {
    try {
        const client: MongoClient = await clientPromise
        const session = client.startSession()

        try {
            let newUser: RecipesUser = {...user}
            let resetToken: PasswordResetToken = emptyToken()
            await session.withTransaction(async () => {
                const password = await hashPassword(randomPassword())
                newUser = {
                    ...user,
                    password,
                    createdOn: Long.fromNumber(DateTime.utc().toMillis()),
                    modifiedOn: Long.fromNumber(-1),
                    deletedOn: Long.fromNumber(-1),
                    emailVerified: Long.fromNumber(-1),
                }
                const result = await usersCollection(client).insertOne(newUser, {session})
                if (result.acknowledged && result.insertedId) {
                    await addUsersRolesMappingFor(result.insertedId.toString(), user.role, session)
                    newUser = {...newUser, id: result.insertedId.toString()}
                    resetToken = await addPasswordResetTokenFor(result.insertedId.toString())
                    return
                }
                return Promise.reject(`Unable to add user; rolling back transaction; email: ${user.email}`)
            })
            return {user: newUser, resetToken}
        } catch (e) {
            console.error(`Unable to add user (transaction): email: ${user.email}`, e)
            return Promise.reject(`Unable to add user; email: ${user.email}`)
        } finally {
            await session.endSession()
        }
    } catch (e) {
        console.error(`Unable to add user (db): email: ${user.email}`, e)
        return Promise.reject(`Unable to add user; email: ${user.email}`)
    }
}

export async function deleteUsers(emails: Array<string>): Promise<number> {
    try {
        const client: MongoClient = await clientPromise

        const result = await usersCollection(client).deleteMany({email: {$in: emails}})
        if (result.acknowledged) {
            return result.deletedCount
        }
        return -1
    } catch (e) {
        console.error(`Unable to delete specified users; emails: [${emails?.join(", ")}]`, e)
        return Promise.reject(`Unable to delete specified users; emails: [${emails?.join(", ")}]`)
    }
}

export async function userByToken(token: string): Promise<RecipesUser> {
    try {
        const client: MongoClient = await clientPromise

        // if the token is not found, or if the token has expired, then return
        // a somewhat cryptic error message
        const tokenData =
            await passwordResetTokenCollection(client).findOne({resetToken: token})
        if (tokenData === undefined || tokenData === null || tokenData.expiration < DateTime.utc().toMillis()) {
            const message = `Invalid token (user from token); token: ${token}`
            console.error(message)
            return Promise.reject(message)
        }

        // grab the user
        const user =
            await usersCollection(client).findOne({_id: new ObjectId(tokenData.userId)})
        if (user === undefined || user === null) {
            const message = `Invalid user for token; token: ${token}`
            console.error(message)
            return Promise.reject(message)
        }

        return {...user, password: "yeah, right!"}
    } catch (e) {
        const message = `Unable to retrieve user by token; invalid token: ${token}`
        console.error(message, e)
        return Promise.reject(message)
    }
}

/**
 * Updates the recipe user's password with the specified one. If the reset token is
 * not found, then this is an invalid token. If the reset token is expired, then this
 * is an invalid token.
 * @param passwordData Holds the reset token and the password use to set a new-user's
 * password
 * @return The user for whom the password was just set
 */
export async function setPasswordFromToken(passwordData: NewPassword): Promise<RecipesUser> {
    const {password, resetToken} = passwordData

    try {
        const client: MongoClient = await clientPromise
        const session: ClientSession = client.startSession()

        // find the username/id based on the reset token
        try {
            // grab the password reset token
            const tokenData =
                await passwordResetTokenCollection(client).findOne({resetToken})

            // if the token is not found, or if the token has expired, then return
            // a somewhat cryptic error message
            if (tokenData === null || tokenData.expiration < DateTime.utc().toMillis()) {
                const message = `Invalid token (set password from token); token: ${resetToken}`
                console.log(message)
                return Promise.reject(message)
            }

            // grab the associated user
            const user =
                await usersCollection(client).findOne({_id: new ObjectId(tokenData.userId)})

            if (user === null) {
                const message = `Invalid user for token; token: ${resetToken}; user_id: ${tokenData.userId}`
                console.log(message)
                return Promise.reject(message)
            }

            const hashedPassword = await hashPassword(password)
            return await session.withTransaction(async () => {
                // update the password
                const updatedUser = {
                    ...user,
                    password: hashedPassword,
                    createdOn: Long.fromNumber(user.createdOn as number),
                    emailVerified: Long.fromNumber(user.emailVerified as number),
                    modifiedOn: Long.fromNumber(DateTime.utc().toMillis())
                }
                await usersCollection(client).updateOne({_id: user._id}, {$set: updatedUser})

                // remove the reset token
                await passwordResetTokenCollection(client).deleteOne({resetToken})

                return updatedUser
            }) as RecipesUser
        } catch (e) {
            const message = `Failed to update password; token: ${resetToken}`
            console.error(message, e)
            return Promise.reject(message)
        } finally {
            await session.endSession()
        }
    } catch (e) {
        const message = `Unable to set password; invalid token: ${resetToken}`
        console.error(message, e)
        return Promise.reject(message)
    }
}

// todo update password
// todo reset password

// todo remove user

// todo update user