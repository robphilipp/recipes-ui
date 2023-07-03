import {Long} from "mongodb";
import {User} from "next-auth";
import {Role} from "./Role";

export interface RecipesUser extends User {
    id: string
    name: string
    email: string
    password: string
    emailVerified: number | null | Long
    createdOn: number | Long
    modifiedOn: number | null | Long
    deletedOn: number | null | Long
    image: string
    role: Role
}