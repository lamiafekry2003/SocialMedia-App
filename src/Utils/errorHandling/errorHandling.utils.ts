import type { NextFunction, Request, Response } from "express";


export interface IError extends Error{
    statusCode:number
}

export class ApplicationException extends Error{
     constructor(message:string,public statusCode:number ,options?:ErrorOptions){
        super(message,options)
        this.name = this.constructor.name
        Error.captureStackTrace(this,this.constructor)  //safety check
     }
}

export class BadRequestException extends ApplicationException{
    constructor(message:string,options?:ErrorOptions){
        super(message,400,options)
    }
}

export class NotFoundException extends ApplicationException{
    constructor(message:string,options?:ErrorOptions){
        super(message,404,options)
    }
}
export class ConflictException extends ApplicationException{
    constructor(message:string,options?:ErrorOptions){
        super(message,409,options)
    }
}

export const globalErrorHandling = (err:IError,req:Request,res:Response,next:NextFunction)=>{
    const status:number = Number(err.statusCode) || 500;
    return res.status(status).json({
        message:err.message ||'someThing went error',
        stack:process.env.MODE === 'DEV' ? err.stack :undefined,
        cause:err.cause
    })
}