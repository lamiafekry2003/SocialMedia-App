import { compare, hash } from "bcrypt"

export const generateHash = async(
    plaintext:string,
    saltRounds:number = Number(process.env.SALT_ROUNDS as string)
):Promise<string> =>{
    return await hash(plaintext,saltRounds)
}

export const compareHash = async(
    plaintext:string,
    hash:string 
):Promise<boolean> =>{
    return await compare(plaintext,hash)
}
