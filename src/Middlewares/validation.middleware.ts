import { NextFunction, Request, Response } from "express";
import { ZodError, ZodType } from "zod";
import { BadRequestException } from "../Utils/errorHandling/errorHandling.utils";
import z from 'zod';

type ReqTypeKey = keyof Request;
type SchemaType = Partial<Record<ReqTypeKey,ZodType>>

export const validation = (schema:SchemaType)=>{

   return (req:Request,res:Response,next:NextFunction): NextFunction=>{
    const validationError:Array<{
        key:ReqTypeKey,
        issues:Array<{message:string,path:(string|number|symbol)[]}>
    }> =[]
    
    for (const key of Object.keys(schema) as ReqTypeKey[]) {
        if(!schema[key]) continue;

        const validationResults = schema[key].safeParse(req[key]);
        if(!validationResults.success){
            const error = validationResults.error as ZodError
            validationError.push({
                key,
                issues:error.issues.map((issue)=>{
                    return {
                        message:issue.message,
                        path:issue.path
                    }
                })
            })
        }
        if(validationError.length > 0 ){
            throw new BadRequestException('validation Error',{
                cause:validationError
            })
        }

    }
     return next() as unknown as NextFunction;
   }
}

export const generalFiled={
    username:z.string({
                error:'username is required'
            }).min(2,{
                error:'must at least 2 '
            }).max(25,{
                error:'must at most 25'
            }),
            email:z.email({
                error:'email is required'
            }),
            password:z.string(),
            confirmPassword:z.string()
}