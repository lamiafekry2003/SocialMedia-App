import type { NextFunction, Request,Response } from "express"
import { HUser, userModel } from "../../DB/Models/user.model"
import { ISignupDto } from "./auth.dto"
import { BadRequestException, ConflictException, NotFoundException } from "../../Utils/errorHandling/errorHandling.utils"
import { UserRepository } from "../../DB/Reposatories/user.repository"
import { compareHash, generateHash } from "../../Utils/security/hash.utils"
import { generateOtp } from "../../Utils/otp/generateOTP.utils"
import { emailEvent } from "../../Utils/events/email.events.utils"
import { createLoginCredentials, createRevokedToken} from "../../Utils/token/token.utils"
import { JwtPayload } from "jsonwebtoken"


class AuthenactionServices{

    private _userModel = new UserRepository(userModel)
    constructor(){}

    signUp =async(req:Request,res:Response,next:NextFunction):Promise<Response>=>{
        const {userName,email,password}: ISignupDto =req.body

        const userExist = await this._userModel.findOne({
            filter:{email},
            select:'email',
            options:{lean:true}
        })
        if(userExist)
             throw new ConflictException('User Already Exists')

        // Hash password
        const hashPassword = await generateHash(password) 
        // generate OTP
        const otp = generateOtp()
        // send email
        emailEvent.emit('confirmEmail',{to:email,otp,username:userName,subject:'Confirm your email'})

       const user = (await this._userModel.createUser({
        data:[
            {
                userName,
                email,
                password:hashPassword,
                confirmEmailOTP:await generateHash(String(otp))
            }
        ],
        options:{
            validateBeforeSave:true
        }
       })) || []
       if(!user){
        throw new BadRequestException('failed to create user')
       }   
        return res.status(201).json({message:'user created Successfully',user})

        // console.log({username,email,password})

    //    try {
    //     signUpSchema.body.parse(req.body)
    //    } catch (error) {
    //     throw new BadRequestException('invalid request data',{cause:JSON.parse(error as string)})
    //    }

    // const validationResult = signUpSchema.body.safeParse(req.body)
    // if(!validationResult.success){
    //     throw new BadRequestException('invaild data',{
    //         cause:JSON.parse(validationResult.error as unknown as string)
    //     })
    // }
    // try {
    //     await signUpSchema.body.parseAsync(req.body)
    // } catch (error) {
    //     throw new BadRequestException('invalid request data',{cause:JSON.parse(error as string)})
    // }
        
        return res.status(201).json({message:'user created Successfully'})

    }
    confirmEmail = async(req:Request,res:Response,next:NextFunction):Promise<Response> =>{
        const {email,otp} = req.body
        const user = await this._userModel.findOne({
            filter:{
                email,
                confirmEmailOTP:{$exists:true},
                confirmedAt:{$exists:false}
            }
        })
        if(!user){
            throw new NotFoundException('invalid Account')
        }
        // compare otp with hash otp
        if(!user?.confirmEmailOTP || !compareHash(otp, user.confirmEmailOTP)){
            throw new BadRequestException('invalid OTP')
        }
        // update user after compare and confirmed email
        const updateUser = await this._userModel.updateOne({
            filter:{email},
            update:{
                confirmedAt:new Date(),
                $unset:{confirmEmailOTP:true}
            }
        })
        return res.status(200).json({message:'user Confirmed Successfully',updateUser})
    }
    
    login =async(req:Request,res:Response):Promise<Response>=>{
        const {email,password} = req.body

        const user = await this._userModel.findOne({
            filter:{email},
        })
        if(!user){
            throw new NotFoundException('invalid Account')
        }

        if(!user.confirmedAt){
            throw new BadRequestException('please confirm your email')
        }

        if(!compareHash(password,user.password)){
            throw new BadRequestException('invalid password')
        }
        // generate token
      
        const credentials = await createLoginCredentials(user)
        // all success

        return res.status(200).json({message:'user logged in Successfully',credentials})

    }

    refreshToken = async(req:Request,res:Response,next:NextFunction):Promise<Response>=>{
        const credentials = await createLoginCredentials(req.user as HUser)
        await createRevokedToken(req.decoded as JwtPayload)
        return res.status(201).json({message:'Done successfully',date:credentials})

    }
}
export default new AuthenactionServices()