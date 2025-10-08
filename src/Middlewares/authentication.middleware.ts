import { NextFunction, Request, Response } from "express"
import { RoleEnum, userModel } from "../DB/Models/user.model"
import { UserRepository } from "../DB/Reposatories/user.repository"
import { BadRequestException, ForbiddenException, NotFoundException, unauthorizedException } from "../Utils/errorHandling/errorHandling.utils"
import { getSignature, SignatureLevelEnum, verifyToken } from "../Utils/token/token.utils"
import { tokenModel } from "../DB/Models/token.model"
import { TokenRepository } from "../DB/Reposatories/token.repository"



export enum TokenEnum{
    ACCESS='ACCESS',
    REFRESH='REFRESH'
}


export const decodeToken = async({
    authorization,
    tokenType=TokenEnum.ACCESS,
}: {
    authorization: String,
    tokenType?: TokenEnum
})=>{
    const userRepo = new UserRepository(userModel)
    const tokenRepo = new TokenRepository(tokenModel)

    const [bearer,token] = authorization.split(" ") || []
    if(!bearer || !token){
        throw new unauthorizedException('Missing token parts')
    }
    const signature = await getSignature(bearer as SignatureLevelEnum)

    // verify token to user can access the thing
    const decoded = await verifyToken({token,
        secret: tokenType === TokenEnum.REFRESH ? signature.refresh_signature :signature.access_signature
    })
    if(!decoded._id || !decoded?.iat){
        throw new unauthorizedException('Invalid token payload')
    };
    // when logout from only device
    if(await tokenRepo.findOne({filter:{jti:decoded.jti}})){
        throw new unauthorizedException('invalid or old login Credentials')
    }

    const user = await userRepo.findOne({
        filter:{_id:decoded._id}
    })

    if(!user){
        throw new NotFoundException('Invalid token user')
    }
    // check when user logout from all devices check by changeCredentialsTime
    if(user.changeCredentialsTime?.getTime() || 0>decoded.iat *100)
        throw new unauthorizedException('invalid or old login Credentials')

    return {decoded,user}
}

// authentication middleware authorization
export const authentication = (accessRole:RoleEnum[] = [] , tokenType:TokenEnum=TokenEnum.ACCESS)=>{
    return async(req:Request,res:Response,next:NextFunction)=>{
        if(!req.headers.authorization){
            throw new BadRequestException('Missing authorization header')
        }
        const {decoded,user} = await decodeToken({authorization:req.headers.authorization,tokenType})
        if(!accessRole.includes(user.role)){
            throw new ForbiddenException('You Are Not authorized to access this role')
        }

        req.user = user
        req.decoded= decoded
        next()
    }
}