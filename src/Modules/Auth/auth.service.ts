import type { NextFunction, Request,Response } from "express"
import { ISignupDto } from "./auth.dto"
// import { BadRequestException } from "../../Utils/errorHandling/errorHandling.utils"
// import { signUpSchema } from "./auth.validation"


class AuthenactionServices{
    signUp =async(req:Request,res:Response,next:NextFunction):Promise<Response>=>{
        // const {username,email,password}: ISignupDto =req.body
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
     login =(req:Request,res:Response):Response=>{
        return res.status(200).json({message:'user logged in Successfully'})

    }
}
export default new AuthenactionServices()