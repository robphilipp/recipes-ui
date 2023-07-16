import {User} from "next-auth";
import {Long} from "mongodb";
import {Role, RoleType} from "./Role";

/**
 * Additional fields we want the user to have that aren't part of the
 * auth.js {@link User}
 */
export type UserAugmentation = {
    password: string
    emailVerified: number | null | Long
    createdOn: number | Long
    modifiedOn: number | null | Long
    deletedOn: number | null | Long
    image: string
    role: Role
}

/**
 * A user of the recipe app that is the auth.js {@link User}, augmented with
 * the additional fields the recipe-book wants. The reason that the recipe
 * user is a composition of these to types/interfaces is that the auth.js allows
 * augmenting their {@link User} (see types/next-auth.d.ts), and so we also
 * need the {@link UserAugmentation} there.
 */
export type RecipesUser = User & UserAugmentation

export const emptyUser: RecipesUser = {
    id: "",
    // augmented values
    password: "",
    emailVerified: null,
    createdOn: -1,
    modifiedOn: null,
    deletedOn: null,
    image: "",
    role: {name: null, description: ""}
}