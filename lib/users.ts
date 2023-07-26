import clientPromise from "./mongodb"
import {ClientSession, Collection, Filter, FindOptions, MongoClient} from "mongodb"
import {RecipesUser} from "../components/users/RecipesUser";
import {addUsersRolesMappingFor} from "./roles";
import {NewPassword} from "../pages/api/passwords/[id]";
import {PasswordResetToken} from "../components/users/PasswordResetToken";
import {DateTime} from "luxon";

if (process.env.mongoDatabase === undefined) {
    throw Error("mongoDatabase not specified in process.env")
}
if (process.env.usersCollection === undefined) {
    throw Error("usersCollection not specified in process.env")
}
if (process.env.usersView === undefined) {
    throw Error("usersView not specified in process.env")
}
if (process.env.passwordResetToken === undefined) {
    throw Error("passwordResetToken not specified in process.env")
}

const MONGO_DATABASE: string = process.env.mongoDatabase
const USERS_COLLECTION: string = process.env.usersCollection
// the users view has users joined with their role information
// this is a richer set of data than what is found in the users
// collection
const USERS_VIEW: string = process.env.usersView

const PASSWORD_RESET_TOKEN_COLLECTION: string = process.env.passwordResetToken

function usersCollection(client: MongoClient): Collection<RecipesUser> {
    return client.db(MONGO_DATABASE).collection(USERS_COLLECTION)
}

function usersView(client: MongoClient): Collection<RecipesUser> {
    return client.db(MONGO_DATABASE).collection(USERS_VIEW)
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
        return await usersView(client).find(filter).toArray()
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

export async function addUser(user: RecipesUser): Promise<RecipesUser> {
    try {
        const client: MongoClient = await clientPromise
        const session = client.startSession()

        // grab the roleId for the roles table
        // const roleId = await roleIdFor(user.role)
        try {
            await session.withTransaction(async () => {
                // todo needs to encrypt the password
                await usersCollection(client).insertOne(user, {session})
                await addUsersRolesMappingFor(user, session)
            })
        } catch (e) {
            console.error(`Unable to add user: email: ${user.email}`, e)
            return Promise.reject(`Unable to add user: email: ${user.email}`)
        } finally {
            await session.endSession()
        }
        return user
    } catch (e) {
        console.error(`Unable to add user: email: ${user.email}`, e)
        return Promise.reject(`Unable to add user: email: ${user.email}`)
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
            await session.withTransaction(async () => {
                // grab the password reset token
                const tokenData =
                    await passwordResetTokenCollection(client).findOne({resetToken})

                // if the token is not found, or if the token has expired, then return
                // a somewhat cryptic error message
                if (tokenData === null || tokenData.expiration < DateTime.utc().toMillis()) {
                    const message = `Invalid token; token: ${resetToken}`
                    console.log(message)
                    return Promise.reject(message)
                }

                // grab the associated user
                const user =
                    await usersCollection(client).findOne({id: tokenData.userId})

                if (user === null) {
                    const message = `Invalid user for token; token: ${resetToken}`
                    console.log(message)
                    return Promise.reject(message)
                }

                // update the password
                const updatedUser: RecipesUser = {...user, password: password}
                await usersCollection(client).updateOne({_id: user._id}, updatedUser)

                // remove the reset token
                await passwordResetTokenCollection(client).deleteOne({resetToken})

                return updatedUser
            })
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
    return Promise.reject(`Something went wrong when updating the password from the token; token: ${resetToken}`)
}
// todo update password
// todo reset password

// todo remove user

// todo update user