import z from 'zod'
import { generalFiled } from '../../Middlewares/validation.middleware'

export const signUpSchema ={
    body:z.strictObject({
        username:generalFiled.username,
        email:generalFiled.email,
        password:generalFiled.password,
        confirmPassword:generalFiled.confirmPassword
    }).superRefine((data,ctx)=>{
        if(data.password !== data.confirmPassword){
            ctx.addIssue({
                code:'custom',
                path:['confirmPassword'],
                message:'password mis match'
            })
        }
    })
    // .refine((data)=>data.password === data.confirmPassword,{
    //     message:'not confirmed'
    // })
}