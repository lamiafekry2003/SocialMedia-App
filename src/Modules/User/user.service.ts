import { NextFunction, Request, Response } from "express";
import { IAcceptFriendRequestDto, ILogoutDto, ISendFriendRequestDto } from "./user.dto";
import { Types, UpdateQuery } from "mongoose";
import { IUser, userModel } from "../../DB/Models/user.model";
import { createRevokedToken, LogoutEnum } from "../../Utils/token/token.utils";
import { UserRepository } from "../../DB/Reposatories/user.repository";
import { JwtPayload } from "jsonwebtoken";
import { deleteFile, deleteFiles, uploadFile, uploadFiles } from "../../Utils/multer/s3.config";
import { StorageEnum } from "../../Utils/multer/cloud.multer";
import { FrientRequestRepository } from "../../DB/Reposatories/feiendRequest.repository";
import { friendRequestModel } from "../../DB/Models/friendRequest.model";
import { BadRequestException, ConflictException, NotFoundException } from "../../Utils/errorHandling/errorHandling.utils";
import { promise } from "zod";


class UserServices{
    private _userModel = new UserRepository(userModel)
    private _friendRequestModel = new FrientRequestRepository(friendRequestModel)
    constructor(){}

    getUser= async(req:Request,res:Response,next:NextFunction)=>{
        
        return res.status(200).json({message:'user found successfully',user:req.user,decoded:req.decoded})

    }

    logout= async(req:Request,res:Response,next:NextFunction)=>{
        const {flag}:ILogoutDto= req.body
        let statusCode=200
        const update:UpdateQuery<IUser>= {}
        switch(flag){
            case LogoutEnum.ALL:
                update.changeCredentialsTime = new Date()
                break;
            case LogoutEnum.ONLY:
                // create revoke token ant store in token model
                await createRevokedToken(req.decoded as JwtPayload)

                statusCode:201
                break;
                default:
                    break;
        }
        await this._userModel.updateOne({
            filter:{_id:req.decoded?._id},
            update
        })

        return res.status(statusCode).json({message:'user logout successfully'})
    }

    profileImage = async(req:Request,res:Response,next:NextFunction):Promise<Response> =>{
        const key = await uploadFile({
            file:req.file as Express.Multer.File,
            path:`users/${req.decoded?._id}/profileImage`
        })

        if (req.user && req.user.profileImage?.key) {
    await deleteFile({
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: req.user.profileImage.key,
    });
  }
  const user = await this._userModel.findOneAndUpdate({
    filter: { _id: req.user?._id },
    update: { profileImage: key },
  });
//   const url = await createGetPreSignedUrl({ Key: key })

  return res.status(200).json({
    message: "Profile image uploaded successfully",data:user,
  });
    }
    
    // using createPreSignedUr
    // profileImage = async(req:Request,res:Response,next:NextFunction):Promise<Response> =>{
    //     const {ContentType,originalname}:{ContentType:string,originalname:string} = req.body
    //     const {url,Key} = await createPreSignedUrl({
    //         ContentType,
    //         originalname,
    //         path:`users/${req?.decoded?._id}`
    //     })

    //     return res.status(200).json({message:'Profile image uploaded Successfully',url,Key})
    // }

    profileCoverImage = async(req:Request,res:Response,next:NextFunction):Promise<Response> =>{

        const urls= await uploadFiles({
            storageApproch:StorageEnum.DISK,
            files:req.files as Express.Multer.File[],
            path:`user/${req?.decoded?._id}/coverImage`
        })

        const user= await this._userModel.findOneAndUpdate({
            filter: { _id: req.user?._id },
            update:{
                coverImages:{urls}
            },
            options:{
                 new: true 
            }
        })
        if (req.user?.coverImages?.urls?.length) {

      for (const oldKey of req.user.coverImages.urls) {
        if(oldKey){
            await deleteFiles({
                Bucket: process.env.AWS_BUCKET_NAME as string,
                Urls:[String(oldKey)],
                Quiet: false,
            })
        }
      }
    }
        return res.status(200).json({message:'cover image uploaded Successfully',data:user})
    }
    
    deleteImage = async(req:Request,res:Response,next:NextFunction):Promise<Response>=>{
        const {Key} = req.query as {Key : string}
        const result = await deleteFile({
            Key :Key as string
        })
        return res.status(200).json({message:'Image deleted successfully',result})

    }
    deleteImages = async(req:Request,res:Response,next:NextFunction):Promise<Response>=>{
        const {Key} = req.query as {Key : string}
        const urls = Key.split(',').map((key) => key.trim())
          const result = await deleteFiles({
            Urls: urls,
            Quiet: false, 
        })
        return res.status(200).json({message:'Images deleted successfully',result})
    }
    sendFriendRequest = async(req:Request,res:Response,next:NextFunction):Promise<Response>=>{
        const {userId} = req.params as ISendFriendRequestDto
        // check friend request exists
        const checkFriendRequestExists = await this._friendRequestModel.findOne({
            filter:{
                createdBy:{ $in: [req.user?._id,userId]} ,
                sendTo:{$in:[req.user?._id,userId]}
            }
        })
        if(checkFriendRequestExists)
            throw new BadRequestException('friend request already sent or user is your friend')
        // check user
        const user =  await this._userModel.findOne({
            filter:{_id:userId}

        })
        if(!user)
            throw new NotFoundException('User not found')

        // create friend request
        const [friedRequest] = await this._friendRequestModel.create({
            data:[{
                createdBy:req.user?._id as Types.ObjectId,
                sendTo: new Types.ObjectId(userId),
            }]
        }) || []

        if(!friedRequest)
            throw new BadRequestException('fail to send friend request')

        return res.status(200).json({message:'friend request sent successfully' ,data:friedRequest})
    }
     acceptFriendRequest = async(req:Request,res:Response,next:NextFunction):Promise<Response>=>{
        const {requestId} = req.params as IAcceptFriendRequestDto
        // check friend request exists
        const checkFriendRequestExists = await this._friendRequestModel.findOneAndUpdate({
            filter:{
                _id:requestId,
                sendTo:req.user?._id,
                acceptedAt:{$exists:false}
            },
            update:{
                acceptedAt:new Date()
            }
        })
        if(!checkFriendRequestExists)
            throw new ConflictException('Fail to accept friend request or friend request not found')
        // update user firends
        await Promise.all([
            await this._userModel.updateOne({
                filter:{
                    _id:checkFriendRequestExists.createdBy
                },
                update:{
                    $addToSet:{
                        friends:checkFriendRequestExists.sendTo
                    }
                }
            }),
            await this._userModel.updateOne({
                filter:{
                    _id:checkFriendRequestExists.sendTo
                },
                update:{
                    $addToSet:{
                        friends:checkFriendRequestExists.createdBy
                    }
                }
            })
        ])


        return res.status(200).json({message:'friend request accepted successfully'})
    }
} 

export default new UserServices()