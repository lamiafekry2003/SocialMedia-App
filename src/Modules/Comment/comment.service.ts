import { NextFunction, Request, Response } from "express"
import { AllowCommentEnum, postModel } from "../../DB/Models/post.model"
import { userModel } from "../../DB/Models/user.model"
import { PostRepository } from "../../DB/Reposatories/post.repository"
import { UserRepository } from "../../DB/Reposatories/user.repository"
import { CommentRepository } from "../../DB/Reposatories/comment.repository"
import { commentModel } from "../../DB/Models/comment.model"
import { IAddCommentDto } from "./comment.dto"
import { postAvailability } from "../Post/post.service"
import { BadRequestException, NotFoundException } from "../../Utils/errorHandling/errorHandling.utils"
import { deleteFiles, uploadFiles } from "../../Utils/multer/s3.config"
import { v4 as uuid } from "uuid"

class CommentService{
    private _postModel = new PostRepository(postModel)
    private _userModel = new UserRepository(userModel)
    private _commentModel = new CommentRepository(commentModel)
    constructor(){}

    addComment= async(req:Request,res:Response,next:NextFunction)=>{
        const {postId} = req.params as IAddCommentDto
        const post = await this._postModel.findOne({
            filter:{
              _id:postId,
              allowComment:AllowCommentEnum.ALLOW,
              $or:postAvailability(req)
            }
        }) ;
        if(!post)
            throw new NotFoundException('Post Does Not Exists')
        // check tags
        if(req.body.tags?.length && (await this._userModel.find({filter:{_id:{$in:req.body.tags}}})).length !== req.body.tags.length){
            throw new NotFoundException('some mentioned user not found')
        }
        // chech attach
         let attachment:string[]=[]
                let asssestFolderId = uuid()
                if(req.files?.length){
                    attachment = await uploadFiles({
                        files:req.files as Express.Multer.File[],
                        path:`users/${post.createdAt}/post/${post.asssestFolderId}`
                    })
                }
        // create post
        const [comment] = (await this._commentModel.create({
            data:[
                {
                    ...req.body,
                    attachment,
                    postId,
                    createdBy:req.user?._id
                }
            ]
        })) || []
        if(!comment){
                    if(attachment.length){
                        await deleteFiles({ Urls: attachment, Quiet: false })
                    }
                    throw new BadRequestException('Fail to Create Comment' )
                }


        return res.status(201).json({message:'Comment Added Successfully',comment})
    }
}
export default new CommentService;