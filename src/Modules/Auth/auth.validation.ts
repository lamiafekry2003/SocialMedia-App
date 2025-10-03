import z from 'zod'
import { generalFiled } from '../../Middlewares/validation.middleware'


export const loginSchema ={
    body:z.strictObject({
        email:generalFiled.email,
        password:generalFiled.password
    })
}

export const signUpSchema ={
   body:loginSchema.body.extend({
     userName:generalFiled.username,
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

export const confirmEmailSchema ={
    body:z.strictObject({
        email:generalFiled.email,
        otp:generalFiled.otp
    })
}


