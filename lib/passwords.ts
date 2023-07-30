import bcrypt from "bcrypt"

const saltRounds = 10

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, saltRounds)
}
