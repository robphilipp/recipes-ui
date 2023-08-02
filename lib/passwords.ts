import bcrypt from "bcrypt"

const saltRounds = 10

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, saltRounds)
}

const LETTERS_LOWER: string = "abcdefghijklmnopqrstuvwxyz"
const LETTERS_UPPER: string = LETTERS_LOWER.toUpperCase()
const NUMBERS: string = "0123456789"
const SPECIALS: string = "-_.#$^%&*"
const CHARACTERS = LETTERS_LOWER + LETTERS_UPPER + NUMBERS + SPECIALS
const NUM_CHARS = CHARACTERS.length

export function randomPassword(length: number = 12): string {
    return randomString(length, CHARACTERS)
}

const ROUTE_HASH_CHARS = LETTERS_LOWER + LETTERS_UPPER + NUMBERS

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
