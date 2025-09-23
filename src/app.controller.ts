import chalk from 'chalk';
import express from 'express'
import type {  Express ,  Request , Response} from 'express'
import { config } from 'dotenv';
import path from 'node:path';
import cors from 'cors'
import helmet from 'helmet';
import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit';
import authRouter from './Modules/Auth/auth.controller'
import { globalErrorHandling } from './Utils/errorHandling/errorHandling.utils';
import connectDB from './DB/connection';

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

    app.use(globalErrorHandling)

    app.listen(port ,()=>console.log(chalk.bgGreen(chalk.black(`Server is running on port ${port}!!`))))
}