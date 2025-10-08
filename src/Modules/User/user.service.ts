import { NextFunction, Request, Response } from "express";
import { ILogoutDto } from "./user.dto";
import { UpdateQuery } from "mongoose";
import { IUser, userModel } from "../../DB/Models/user.model";
import { createRevokedToken, LogoutEnum } from "../../Utils/token/token.utils";
import { UserRepository } from "../../DB/Reposatories/user.repository";
import { JwtPayload } from "jsonwebtoken";


class UserServices{
    private _userModel = new UserRepository(userModel)
    constructor(){}

    getUser= async(req:Request,res:Response,next:NextFunction)=>{
        
        return res.status(200).json({message:'user found successfully',user:req.user,decoded:req.decoded})

    }

    logout= async(req:Request,res:Response,next:NextFunction)=>{
        const {flag}:ILogoutDto= req.body
        let statusCode=200
        const update:UpdateQuery<IUser>= {}
        switch(flag){
            case LogoutEnum.ALL:
                update.changeCredentialsTime = new Date()
                break;
            case LogoutEnum.ONLY:
                // create revoke token ant store in token model
                await createRevokedToken(req.decoded as JwtPayload)

                statusCode:201
                break;
                default:
                    break;
        }
        await this._userModel.updateOne({
            filter:{_id:req.decoded?._id},
            update
        })

        return res.status(statusCode).json({message:'user logout successfully'})
    }
} 

export default new UserServices()