
import { Secret, sign, SignOptions } from "jsonwebtoken";

export const generateToken = async({
    payload,
    secret=process.env.ACCESS_USER_SIGNTURE as string,
    options={
    expiresIn: 60 * 60 * 24,
  }
}:{
    payload:object,
    secret?:Secret,
    options?:SignOptions
}):Promise<String>=>{
    return await sign(payload,secret,options)
}