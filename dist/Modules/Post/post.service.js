"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postAvailability = void 0;
const post_repository_1 = require("../../DB/Reposatories/post.repository");
const post_model_1 = require("../../DB/Models/post.model");
const user_repository_1 = require("../../DB/Reposatories/user.repository");
const user_model_1 = require("../../DB/Models/user.model");
const errorHandling_utils_1 = require("../../Utils/errorHandling/errorHandling.utils");
const uuid_1 = require("uuid");
const s3_config_1 = require("../../Utils/multer/s3.config");
const mongoose_1 = require("mongoose");
const postAvailability = (req) => {
    return [
        { availabilty: post_model_1.AvailabilityEnum.PUBLIC },
        { availabilty: post_model_1.AvailabilityEnum.ONLYME, createdBy: req.user?._id },
        { availabilty: post_model_1.AvailabilityEnum.FRIENDS, createdBy: {
                $in: [...(Array.isArray(req.user?.friends) ? req.user.friends : []), req.user?._id]
            } }
    ];
};
exports.postAvailability = postAvailability;
class PostService {
    _postModel = new post_repository_1.PostRepository(post_model_1.postModel);
    _userModel = new user_repository_1.UserRepository(user_model_1.userModel);
    constructor() { }
    createPost = async (req, res, next) => {
        if (req.body.tags?.length && (await this._userModel.find({ filter: { _id: { $in: req.body.tags } } })).length !== req.body.tags.length) {
            throw new errorHandling_utils_1.NotFoundException('some mentioned user not found');
        }
        let attachment = [];
        let asssestFolderId = (0, uuid_1.v4)();
        if (req.files?.length) {
            attachment = await (0, s3_config_1.uploadFiles)({
                files: req.files,
                path: `users/${req.user?._id}/post/${asssestFolderId}`
            });
        }
        const [post] = (await this._postModel.create({
            data: [
                {
                    ...req.body,
                    attachment,
                    asssestFolderId,
                    createdBy: req.user?._id
                }
            ]
        })) || [];
        if (!post) {
            if (attachment.length) {
                await (0, s3_config_1.deleteFiles)({ Urls: attachment, Quiet: false });
            }
            throw new errorHandling_utils_1.BadRequestException('Fail to Create Post');
        }
        res.status(201).json({ message: 'post Created Successfully', post });
    };
    likeUnlikePost = async (req, res, next) => {
        const { postId } = req.params;
        const { action } = req.query;
        let update = {
            $addToSet: { likes: req.user?._id }
        };
        if (action === post_model_1.ActionEnum.UNLIKE) {
            update = { $pull: { likes: req.user?._id } };
        }
        const post = await this._postModel.findOneAndUpdate({
            filter: {
                _id: postId,
                $or: (0, exports.postAvailability)(req)
            },
            update,
        });
        if (!post)
            throw new errorHandling_utils_1.NotFoundException('Post does not exists');
        res.status(201).json({ message: 'Done', post });
    };
    updatePost = async (req, res, next) => {
        const { postId } = req.params;
        const post = await this._postModel.findOne({
            filter: {
                _id: postId,
                createdBy: req.user?._id
            }
        });
        if (!post) {
            throw new errorHandling_utils_1.NotFoundException('Post Does Not Exist ');
        }
        if (req.body.tags?.length && (await this._userModel.find({ filter: { _id: { $in: req.body.tags } } })).length !== req.body.tags.length) {
            throw new errorHandling_utils_1.NotFoundException('some mentioned user not found');
        }
        let attachment = [];
        if (req.files?.length) {
            attachment = await (0, s3_config_1.uploadFiles)({
                files: req.files,
                path: `users/${post.createdBy}/post/${post.asssestFolderId}`
            });
        }
        const updatePost = await this._postModel.updateOne({
            filter: { _id: postId },
            update: [
                {
                    $set: {
                        content: req.body.content || post.content,
                        allowComment: req.body.allowComment || post.allowComment,
                        availabilty: req.body.availabilty || post.availabilty,
                        attachment: {
                            $setUnion: [
                                {
                                    $setDifference: [
                                        '$attachment',
                                        req.body.removeAttachment || []
                                    ]
                                },
                                attachment
                            ]
                        },
                        tags: {
                            $setUnion: [
                                {
                                    $setDifference: [
                                        '$tags',
                                        (req.body.removeTags || []).map((tag) => {
                                            return mongoose_1.Types.ObjectId.createFromHexString(tag);
                                        })
                                    ]
                                },
                                (req.body.tags || []).map((tag) => {
                                    return mongoose_1.Types.ObjectId.createFromHexString(tag);
                                })
                            ]
                        },
                    }
                }
            ]
        });
        if (!updatePost.modifiedCount) {
            if (attachment.length) {
                await (0, s3_config_1.deleteFiles)({ Urls: attachment });
            }
            throw new errorHandling_utils_1.BadRequestException('Fail to update post');
        }
        else {
            if (req.body.removeAttachment?.length) {
                await (0, s3_config_1.deleteFiles)({ Urls: req.body.removeAttachment });
            }
        }
        res.status(200).json({ message: 'post updated Successfully', updatePost });
    };
    getPosts = async (req, res, next) => {
        const { page, size } = req.query;
        const posts = await this._postModel.paginate({
            filter: { $or: (0, exports.postAvailability)(req) },
            page,
            size
        });
        return res.status(200).json({ message: 'posts found successfully', posts });
    };
}
exports.default = new PostService;
