import type { NextFunction, Request, Response } from "express"
import { PostRepository } from "../../DB/Reposatories/post.repository"
import { postModel } from "../../DB/Models/post.model"
import { UserRepository } from "../../DB/Reposatories/user.repository"
import { userModel } from "../../DB/Models/user.model"

class PostService{
    private _postModel = new PostRepository(postModel)
    private userModel = new UserRepository(userModel)

    constructor(){}
    createPost= async(req:Request,res:Response,next:NextFunction)=>{
        res.status(201).json({message:'post Created Successfully'})

    }
}
export default new PostService