import type { NextFunction, Request, Response } from "express"
import { PostRepository } from "../../DB/Reposatories/post.repository"
import { ActionEnum, AvailabilityEnum, postModel } from "../../DB/Models/post.model"
import { UserRepository } from "../../DB/Reposatories/user.repository"
import { HUser, userModel } from "../../DB/Models/user.model"
import { BadRequestException, NotFoundException } from "../../Utils/errorHandling/errorHandling.utils"
import { v4 as uuid } from "uuid"
import { deleteFiles, uploadFiles } from "../../Utils/multer/s3.config"
import { ILikePostDto} from "./post.dto"
import { Types, UpdateQuery } from "mongoose"

export const postAvailability=(req:Request)=>{
    return [
        {availabilty:AvailabilityEnum.PUBLIC},
        {availabilty:AvailabilityEnum.ONLYME , createdBy:req.user?._id},
        {availabilty:AvailabilityEnum.FRIENDS,createdBy:{
            $in:[...(Array.isArray(req.user?.friends) ? req.user.friends : []), req.user?._id]
        }}

    ]
}

class PostService{
    private _postModel = new PostRepository(postModel)
    private _userModel = new UserRepository(userModel)

    constructor(){}
    // create post
    createPost= async(req:Request,res:Response,next:NextFunction)=>{
        // check tags
        if(req.body.tags?.length && (await this._userModel.find({filter:{_id:{$in:req.body.tags}}})).length !== req.body.tags.length){
            throw new NotFoundException('some mentioned user not found')
        }

        let attachment:string[]=[]
        let asssestFolderId = uuid()
        if(req.files?.length){
            attachment = await uploadFiles({
                files:req.files as Express.Multer.File[],
                path:`users/${req.user?._id}/post/${asssestFolderId}`
            })
        }

        const [post] = (await this._postModel.create({
            data:[
                {
                    ...req.body,
                    attachment,
                    asssestFolderId,
                    createdBy:req.user?._id
                }
            ]
        })) || []

        if(!post){
            if(attachment.length){
                await deleteFiles({ Urls: attachment, Quiet: false })
            }
            throw new BadRequestException('Fail to Create Post' )
        }
        res.status(201).json({message:'post Created Successfully' , post})

    }
    // like post
    likeUnlikePost= async(req:Request,res:Response,next:NextFunction)=>{
        const { postId } = req.params as { postId: string }
        // action(like,unlike)
        const {action} = req.query as ILikePostDto
        
        let update:UpdateQuery<HUser> ={
            $addToSet:{likes:req.user?._id}
        }
        // if(action unlike)
        if(action === ActionEnum.UNLIKE){
            update ={$pull:{likes:req.user?._id}}
        }

        const post = await this._postModel.findOneAndUpdate({
            filter:{
                _id:postId,
                $or:postAvailability(req)
            },
            update,
        })
        if(!post)
            throw new NotFoundException('Post does not exists')
        
       
        res.status(201).json({message:'Done' ,post})

    }
    // update post
    updatePost= async(req:Request,res:Response,next:NextFunction)=>{
        const {postId} = req.params as unknown as {postId:string}
        // check post found or no
        const post = await this._postModel.findOne({
            filter:{
                _id:postId,
                createdBy:req.user?._id
            }
        })
        if(!post){
            throw new NotFoundException('Post Does Not Exist ' )
        }
        // check tags found
         if(req.body.tags?.length && (await this._userModel.find({filter:{_id:{$in:req.body.tags}}})).length !== req.body.tags.length){
            throw new NotFoundException('some mentioned user not found')
        }
        // check attachment found
        let attachment:string[]=[]
        if(req.files?.length){
            attachment = await uploadFiles({
                files:req.files as Express.Multer.File[],
                path:`users/${post.createdBy}/post/${post.asssestFolderId}`
            })
        }
        // update post using aggregation [{} {}]
        const updatePost = await this._postModel.updateOne({
            filter:{_id:postId},
            update:[
                {
                    $set:{
                        content:req.body.content || post.content,
                        allowComment:req.body.allowComment || post.allowComment,
                        availabilty:req.body.availabilty || post.availabilty,
                        attachment:{
                            $setUnion:[
                                {
                                    $setDifference:[
                                        '$attachment',
                                        req.body.removeAttachment || []
                                    ]
                                },
                                attachment
                            ]
                        },
                         tags:{
                            $setUnion:[
                                {
                                    $setDifference:[
                                        '$tags',
                                        (req.body.removeTags || []).map((tag:string)=>{
                                            return Types.ObjectId.createFromHexString(tag)
                                        })
                                    ]
                                },
                               (req.body.tags || []).map((tag:string)=>{
                                return Types.ObjectId.createFromHexString(tag)
                               })
                            ]
                        },

                    }
                }
            ]
        })
        if(!updatePost.modifiedCount){
            if(attachment.length){
                await deleteFiles({Urls:attachment})
            }
            throw new BadRequestException('Fail to update post')
        }else{
            if(req.body.removeAttachment?.length){
                await deleteFiles({Urls:req.body.removeAttachment})
            }
        }
        res.status(200).json({message:'post updated Successfully' , updatePost})

    }
    // get posts
    getPosts= async(req:Request,res:Response,next:NextFunction)=>{
        const {page ,size} = req.query as unknown as {page:number,size:number}
        const posts = await this._postModel.paginate({
            filter:{$or:postAvailability(req)},
           page,
           size
            
        })
        return res.status(200).json({message:'posts found successfully',posts})
    }
    

}
export default new PostService;
