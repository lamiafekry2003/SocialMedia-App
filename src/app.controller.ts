import chalk from 'chalk';
import express from 'express'
import type {  Express ,  Request , Response} from 'express'
import { config } from 'dotenv';
import path from 'node:path';
import cors from 'cors'
import helmet from 'helmet';
import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit';
import authRouter from './Modules/Auth/auth.controller'
import userRouter from './Modules/User/user.controller'
import { BadRequestException, globalErrorHandling } from './Utils/errorHandling/errorHandling.utils';
import connectDB from './DB/connection';
import { createGetPreSignedUrl, getFile } from './Utils/multer/s3.config';
import { promisify } from 'node:util';
import {pipeline} from 'node:stream'


const createWriteStreamPip=promisify(pipeline)

// env config
config({path:path.resolve('./config/.env.dev')})
// rate limit
const limiter:RateLimitRequestHandler = rateLimit({
    windowMs:15*60*1000,
    limit:100,
    message:{
        status:429,
        message:'To many requests , please try later'
    }
})

export const bootstrap =async():Promise<void>=>{
    const app:Express = express()
    const port:number = Number(process.env.PORT) ||3000;
    app.use(express.json())
    app.use(cors())
    app.use(helmet())
    app.use(limiter)
    await connectDB()

    app.get('/users',(req:Request,res:Response)=>{
        return res.status(200).json({message:'Hello from social media project'})
    })

    app.use('/api/auth',authRouter);
    app.use('/api/user',userRouter);

    // upload assests using stream
    app.get('/upload/*path',async(req:Request,res:Response)=>{
        const {downloadName} = req.query
        const {path} = req.params as unknown as {path:string[]}
        const Key = path.join('/')
        const s3Response= await getFile({Key})
        if(! s3Response?.Body){
            throw new BadRequestException('Fail to get assests')
        }
        res.setHeader('Content-Type',`${s3Response.ContentType}` || "application/octet-stream")
        if(downloadName){
            res.setHeader('Content-Disposition',`attachment;filename=${downloadName}`)
        }
        return await createWriteStreamPip(
            s3Response.Body as NodeJS.ReadableStream,
            res
        )
    })
    // upload using presigned
    app.get('/upload/presigned/*path',async(req:Request,res:Response)=>{
        const {downloadName,download} = req.query as {
            downloadName?:string,
            download?:string
        }
        const {path} = req.params as unknown as {path:string[]}
        const Key = path.join('/')
        const url = await createGetPreSignedUrl({
            Key,
            downloadName:downloadName as string,
            download:download as string
        }
        )
        return res.status(200).json({message:'Done',url})
    })

    app.use(globalErrorHandling)

    app.listen(port ,()=>console.log(chalk.bgGreen(chalk.black(`Server is running on port ${port}!!`))))
}