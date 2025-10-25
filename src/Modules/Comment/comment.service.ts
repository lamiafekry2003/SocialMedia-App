import { NextFunction, Request, Response } from "express";
import { AllowCommentEnum, HPDocument, postModel } from "../../DB/Models/post.model";
import { userModel } from "../../DB/Models/user.model";
import { PostRepository } from "../../DB/Reposatories/post.repository";
import { UserRepository } from "../../DB/Reposatories/user.repository";
import { CommentRepository } from "../../DB/Reposatories/comment.repository";
import { commentModel } from "../../DB/Models/comment.model";
import { IAddCommentDto, IReplayCommentDto } from "./comment.dto";
import { postAvailability } from "../Post/post.service";
import {
  BadRequestException,
  NotFoundException,
} from "../../Utils/errorHandling/errorHandling.utils";
import { deleteFiles, uploadFiles } from "../../Utils/multer/s3.config";
import { Types } from "mongoose";

class CommentService {
  private _postModel = new PostRepository(postModel);
  private _userModel = new UserRepository(userModel);
  private _commentModel = new CommentRepository(commentModel);
  constructor() {}

  addComment = async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params as IAddCommentDto;
    const post = await this._postModel.findOne({
      filter: {
        _id: postId,
        allowComment: AllowCommentEnum.ALLOW,
        $or: postAvailability(req),
      },
    });
    if (!post) throw new NotFoundException("Post Does Not Exists");
    // check tags
    if (
      req.body.tags?.length &&
      (await this._userModel.find({ filter: { _id: { $in: req.body.tags } } }))
        .length !== req.body.tags.length
    ) {
      throw new NotFoundException("some mentioned user not found");
    }
    // chech attach
    let attachment: string[] = [];
    if (req.files?.length) {
      attachment = await uploadFiles({
        files: req.files as Express.Multer.File[],
        path: `users/${post.createdAt}/post/${post.asssestFolderId}`,
      });
    }
    // create post
    const [comment] =
      (await this._commentModel.create({
        data: [
          {
            ...req.body,
            attachment,
            postId,
            createdBy: req.user?._id,
          },
        ],
      })) || [];
    if (!comment) {
      if (attachment.length) {
        await deleteFiles({ Urls: attachment, Quiet: false });
      }
      throw new BadRequestException("Fail to Create Comment");
    }

    return res
      .status(201)
      .json({ message: "Comment Added Successfully", comment });
  };
//   create replay comment 
  createReplay = async (req: Request, res: Response, next: NextFunction) => {
    const { postId, commentId } = req.params as IReplayCommentDto;
    // const { postId,commentId } = req.params as unknown as {
    //     postId:Types.ObjectId,
    //     commentId:Types.ObjectId
    // }
    const comment = await this._commentModel.findOne({
      filter: {
        _id: commentId,
        postId: postId,
      },
      options: {
        populate: [
          {
            path: "postId",
            match: {
              allowComment: AllowCommentEnum.ALLOW,
              $or: postAvailability(req),
            },
          },
        ],
      },
    });
    if (!comment?.postId)
      throw new NotFoundException("Comment or Post Does Not Exists");
    // check tags
    if (
      req.body.tags?.length &&
      (await this._userModel.find({ filter: { _id: { $in: req.body.tags } } }))
        .length !== req.body.tags.length
    ) {
      throw new NotFoundException("some mentioned user not found");
    }
    // chech attach
    let attachment: string[] = [];
    if (req.files?.length) {
      const post = comment.postId as Partial<HPDocument>
      attachment = await uploadFiles({
        files: req.files as Express.Multer.File[],
        path: `users/${post.createdAt}/post/${post.asssestFolderId}`,
      });
    }
    // create replaycomment
    const [replay] =
      (await this._commentModel.create({
        data: [
          {
            ...req.body,
            attachment,
            postId,
            commentId,
            createdBy: req.user?._id,
          },
        ],
      })) || [];
    if (!replay) {
      if (attachment.length) {
        await deleteFiles({ Urls: attachment, Quiet: false });
      }
      throw new BadRequestException("Fail to Create Replay");
    }
    return res
      .status(201)
      .json({ message: "Replay comment Added Successfully", replay });
  
  };
}
export default new CommentService();
