import {Long} from "mongodb";

export type User = {
    name: string
    email: string
    password: string
    emailVerified: number | null | Long
    createdOn: number | Long
    modifiedOn: number | null | Long
    deletedOn: number | null | Long
    image: string

}