
import { JwtPayload, Secret, sign, SignOptions, verify } from "jsonwebtoken";
import { HUser, RoleEnum } from "../../DB/Models/user.model";
import {v4 as uuid4} from 'uuid'
import { TokenRepository } from "../../DB/Reposatories/token.repository";
import { tokenModel } from "../../DB/Models/token.model";
import { BadRequestException } from "../errorHandling/errorHandling.utils";


export enum SignatureLevelEnum{
    USER="USER",
    ADMIN="ADMIN"
}
export enum LogoutEnum{
    ONLY='ONLY',
    ALL='ALL'
}

export const generateToken = async({
    payload,
    secret=process.env.ACCESS_USER_SIGNATURE as string,
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
export const getSignatureLevel = async(role:RoleEnum = RoleEnum.USER)=>{
    let signatureLevel = SignatureLevelEnum.USER;
    // replace bearer by this role
    switch(role){
        case RoleEnum.ADMIN:
            signatureLevel = SignatureLevelEnum.ADMIN
            break;
        case RoleEnum.USER:
            signatureLevel = SignatureLevelEnum.USER
        default:
            break;
    }
    return signatureLevel;

}

export const getSignature = async(signatureLevel:SignatureLevelEnum = SignatureLevelEnum.USER)=>{
    let signature:{access_signature:string,refresh_signature:string} = {access_signature:'',refresh_signature:''}
    switch(signatureLevel){
        case SignatureLevelEnum.ADMIN:
           signature.access_signature = process.env.ACCESS_ADMIN_SIGNATURE as string
           signature.refresh_signature = process.env.REFRESH_ADMIN_SIGNATURE as string
           break;
        case SignatureLevelEnum.USER:
            signature.access_signature = process.env.ACCESS_USER_SIGNATURE as string
            signature.refresh_signature = process.env.REFRESH_USER_SIGNATURE as string
        default:
            break;
    }
    return signature;
}
export const createLoginCredentials = async(user:HUser)=>{

    const signatureLevel= await getSignatureLevel(user.role)
    const signature = await getSignature(signatureLevel)
    const jwtid = uuid4()

     const accessToken = await generateToken({payload:{_id:user._id},secret:signature.access_signature,options:{
        expiresIn:Number(process.env.ACCESS_EXPIRES_IN) ,
        jwtid
     }})
     const refreshToken = await generateToken({payload:{_id:user._id},secret:signature.refresh_signature,options:{
        expiresIn:Number(process.env.REFRESH_EXPIRES_IN),
        jwtid
     }})
     return {accessToken,refreshToken}

}

export const verifyToken = async({token , secret=process.env.ACCESS_USER_SIGNTURE as string}:{
    token:string,
    secret?:Secret
}):Promise<JwtPayload>=>{
    return await verify(token,secret) as JwtPayload
}

// create revoke token when logout or create new credentials
export const createRevokedToken = async(decoded:JwtPayload)=>{
    const tokenMode = new TokenRepository(tokenModel)
   const [result] = (await tokenMode.create({
        data:[{
            jti:decoded?.jti as string,
            expireIn:(decoded?.iat as number) + Number(process.env.REFRESH_EXPIRES_IN),
                userId:decoded?._id
            }],
            options:{
                validateBeforeSave:true
            }
    })) || []
    if(!result)
        throw new BadRequestException('Failed to revoke token')
    return result
}
