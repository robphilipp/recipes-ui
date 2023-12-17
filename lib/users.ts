import clientPromise from "./mongodb"
import {ClientSession, Collection, Filter, Long, MongoClient, ObjectId} from "mongodb"
import {RecipesUser} from "../components/users/RecipesUser";
import {addUsersRolesMappingFor, deleteUsersRoleMappingsFor} from "./roles";
import {NewPassword} from "../pages/api/passwords/[id]";
import {emptyToken, PasswordResetToken} from "../components/passwords/PasswordResetToken";
import {DateTime} from "luxon";
import {addPasswordResetTokenFor, hashPassword, randomPassword} from "./passwords";
import {Document} from "bson"
import {Role, RoleLiteral} from "../components/users/Role";

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

const now = () => Long.fromNumber(DateTime.utc().toMillis())
const never = () => Long.fromNumber(-1)

export async function usersCount(filter?: Document): Promise<number> {
    try {
        const client: MongoClient = await clientPromise
        return await usersCollection(client).countDocuments(filter)
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

export async function users(filter: Filter<RecipesUser> = {}): Promise<Array<RecipesUser>> {
    try {
        const client: MongoClient = await clientPromise
        return await usersCollection(client)
            .find(filter)
            .map(user => ({...user, id: user._id.toString()}))
            .toArray()
    } catch (e) {
        console.error("Unable to retrieve users", e)
        return Promise.reject("Unable to retrieve users")
    }
}

export async function userById(id: string): Promise<RecipesUser> {
    try {
        const client: MongoClient = await clientPromise
        const user = await usersCollection(client)
            .findOne({_id: new ObjectId(id)})
        if (user === null) {
            const message: string = `Unable to retrieve user by ID; user_id: ${id}`
            console.error(message)
            return Promise.reject(message)
        }
        return user
    } catch (e) {
        const message: string = `Unable to retrieve user by ID; user_id: ${id}`
        console.error(message, e)
        return Promise.reject(message)
    }
}

export async function userRoleById(id: string): Promise<Role> {
    const user = await userById(id)
    return user.role
}

export async function usernameExists(name: string): Promise<boolean> {
    try {
        const numUsers = await usersCount({name})
        return numUsers > 0
    } catch (e) {
        const message = `Unable to determine whether username already exists; name: ${name}`
        console.error(message, e)
        return Promise.reject(message)
    }
}

export async function emailExists(email: string): Promise<boolean> {
    try {
        const numUsers = await usersCount({email})
        return numUsers > 0
    } catch (e) {
        const message = `Unable to determine whether email already exists; name: ${email}`
        console.error(message, e)
        return Promise.reject(message)
    }
}

// export async function userFor(email: string): Promise<RecipesUser> {
//     try {
//         const client: MongoClient = await clientPromise
//         const user = await usersCollection(client).findOne({email: email})
//         if (user === null) {
//             console.log(`Unable to retrieve user: email: ${email}`)
//             return Promise.reject(`Unable to retrieve user: email: ${email}`)
//         }
//         return user
//     } catch(e) {
//         console.error(`Unable to retrieve user: email: ${email}`, e)
//         return Promise.reject(`Unable to retrieve user: email: ${email}`)
//     }
// }

/*
 * Helper types and function for retrieving users based on their email address and
 * manipulating the results
 */
type EmailId = {email: string, id: string}
type EmailToIdsResult = {
    foundEmailIds: Array<EmailId>
    notFoundEmails: Array<string>
}

function splitIdsFromEmails(idEmails: Array<EmailId>): [ids: Array<string>, emails: Array<string>] {
    return idEmails.reduce(
        (result, emailId) => {
            result[0].push(emailId.id)
            result[1].push(emailId.email)
            return result
        },
        [[], []] as [Array<string>, Array<string>]
    )
}

/**
 * Attempts to find the user IDs for the specified array of emails. Returns a result
 * object that holds a list of (email, ID) tuples for all the users associated with the
 * specified emails, and a list of emails for all the emails for which no user was
 * found.
 * @param emails A list of users for which to retrieve emails
 * @return A {@link EmailToIdsResult} object holding the emails that were found and
 * the emails that were not found.
 */
export async function userIdsFor(emails: Array<string>): Promise<EmailToIdsResult> {
    try {
        const client: MongoClient = await clientPromise

        // grab the user associated with each email address
        const users = await usersCollection(client)
            .find({email: {$in: emails as string[]}})
            .toArray()
        // convert the user to a (email, id) tuple for each user whose email address and
        // user ID is not an empty string
        const emailIds = users
            .map(user => ({email: user.email || "", id: user._id.toString()}))
            .filter((emailId: EmailId) => emailId.email.length > 0 && emailId.id.length > 0)

        // construct the results object the holds the ids that were found
        return emails.reduce(
            (result: EmailToIdsResult, email: string) => {
                const ei: EmailId | undefined = emailIds.find((ei: EmailId) => ei.email === email)
                if (ei !== undefined && ei.id.length > 0) {
                    result.foundEmailIds.push(ei)
                } else {
                    result.notFoundEmails.push(email)
                }
                return result
            },
            {foundEmailIds: [], notFoundEmails: []} as EmailToIdsResult
        )
    } catch (e) {
        const message = `Unable to find user IDs for emails; emails: [${emails?.join(", ")}]`
        console.error(message, e)
        return Promise.reject(message)
    }
}

/*
 * Helper type for holding the results of adding a user
 */
export type AddedUserInfo = {
    user: RecipesUser
    resetToken: PasswordResetToken
}

/**
 * Transactional add of a user, the user-to-role mapping, and a password-reset
 * token. Accepts a {@link RecipesUser}, creates a random password for the user,
 * and returns user info that contains the added user along with a password-reset
 * token. This password-reset token allows the user to set their initial password.
 * @param user The user to add to the system
 * @return A {@link AddedUserInfo} object holding the added user and the
 * reset-password token.
 */
export async function addUser(user: RecipesUser): Promise<AddedUserInfo> {
    try {
        const client: MongoClient = await clientPromise
        const session = client.startSession()

        try {
            let newUser: RecipesUser = {...user}
            let resetToken: PasswordResetToken = emptyToken()
            await session.withTransaction(async () => {
                // create a hash of a random password (will need to be reset by the user)
                const password = await hashPassword(randomPassword())

                // add the user to mongo
                newUser = {
                    ...user,
                    password,
                    createdOn: now(),
                    modifiedOn: never(),
                    deletedOn: never(),
                    emailVerified: never(),
                }
                const result = await usersCollection(client).insertOne(newUser, {session})

                // if the user was added successfully, attempt to add user-to-role mapping,
                // and if that succeeds, then add the password-reset token to mongo
                if (result.acknowledged && result.insertedId) {
                    await addUsersRolesMappingFor(result.insertedId.toString(), user.role, session)
                    newUser = {...newUser, id: result.insertedId.toString()}
                    resetToken = await addPasswordResetTokenFor(result.insertedId.toString())
                    return
                }

                // failed to add the user, so complain
                return Promise.reject(`Unable to add user; rolling back transaction; email: ${user.email}`)
            })

            // successfully added the user, so commit the transaction and return the new user
            // await session.commitTransaction()
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

/**
 * Attempts to update the user. Only the currently allowed user properties will be
 * updated: name, email, role. The modifiedOn value will be updated with the current
 * date time. If successful, returns the updated user.
 * @param user The updated user
 * @return When the update is successful, a resolved promise to the updated user; otherwise
 * a rejected promise
 */
export async function updateUser(user: RecipesUser): Promise<RecipesUser> {
    try {
        const client: MongoClient = await clientPromise
        const session: ClientSession = client.startSession()

        try {
            const modifiedOn = now()
            let updateUser = {
                name: user.name,
                email: user.email,
                role: user.role,
                modifiedOn
            }
            await session.withTransaction(async () => {
                const result = await usersCollection(client)
                    .updateOne({_id: new ObjectId(user.id)}, {$set: {...updateUser}})
                if (result.acknowledged && result.matchedCount === 1 && result.modifiedCount === 1) {
                    return
                }

                return Promise.reject(`Unable to update the user; rolling back the transaction; user_id: ${user.id}`)
            })

            // successfully updated user
            return {...user, modifiedOn}
        } catch (e) {
            const message = `Unable to update user (transaction): user_id: ${user.id}`
            console.error(message, e)
            return Promise.reject(message)
        } finally {
            await session.endSession()
        }
    } catch (e) {
        const message = `Unable to update user (db): user_id: ${user.id}`
        console.error(message, e)
        return Promise.reject(message)
    }
}

/**
 * Attempts to delete the users by the specified email address
 * @param emails A list of email address to delete
 */
export async function deleteUsersByEmail(emails: Array<string>): Promise<number> {
    try {
        const client: MongoClient = await clientPromise
        const session = client.startSession()

        let numDeleted = 0
        await session.withTransaction(async () => {
            // grab the user IDs **before** the users are deleted, and figure out which
            // emails had associated IDs (which they all should)
            const {foundEmailIds, notFoundEmails} = await userIdsFor(emails)
            if (notFoundEmails.length > 0) {
                console.warn(`Failed to find IDs for ${notFoundEmails.length} emails, will continue; emails: [${notFoundEmails.join((", "))}]`)
            }
            // no need to continue if none of the emails were in the database
            if (foundEmailIds.length === 0) {
                return Promise.reject(`Failed to find any IDs for emails; emails: [${emails.join(", ")}]`)
            }

            // decompose (email, id) tuples into an array of found IDs and found emails
            const [foundIds, foundEmails] = splitIdsFromEmails(foundEmailIds)

            // delete the users
            const result = await usersCollection(client).deleteMany({email: {$in: foundEmails}})
            if (result.acknowledged) {
                numDeleted = result.deletedCount
                return
            }

            // remove the user-to-role mappings and make sure that the same number of role mappings
            // were removed
            const mappingsRemoved = await deleteUsersRoleMappingsFor(foundIds)
            if (mappingsRemoved !== numDeleted) {
                numDeleted = -1
                return Promise.reject(`Refusing to delete users because could not remove user-to-role mappings (rollback); emails: [${emails?.join(", ")}]`)
            }

            // todo delete an password-reset tokens (failure here is ok)

            return Promise.reject(`Failed to delete users (rollback); emails: [${emails?.join(", ")}]`)
        })
        // await session.commitTransaction()
        return numDeleted
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