"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const post_model_1 = require("../../DB/Models/post.model");
const user_model_1 = require("../../DB/Models/user.model");
const post_repository_1 = require("../../DB/Reposatories/post.repository");
const user_repository_1 = require("../../DB/Reposatories/user.repository");
const comment_repository_1 = require("../../DB/Reposatories/comment.repository");
const comment_model_1 = require("../../DB/Models/comment.model");
const post_service_1 = require("../Post/post.service");
const errorHandling_utils_1 = require("../../Utils/errorHandling/errorHandling.utils");
const s3_config_1 = require("../../Utils/multer/s3.config");
const uuid_1 = require("uuid");
class CommentService {
    _postModel = new post_repository_1.PostRepository(post_model_1.postModel);
    _userModel = new user_repository_1.UserRepository(user_model_1.userModel);
    _commentModel = new comment_repository_1.CommentRepository(comment_model_1.commentModel);
    constructor() { }
    addComment = async (req, res, next) => {
        const { postId } = req.params;
        const post = await this._postModel.findOne({
            filter: {
                _id: postId,
                allowComment: post_model_1.AllowCommentEnum.ALLOW,
                $or: (0, post_service_1.postAvailability)(req)
            }
        });
        if (!post)
            throw new errorHandling_utils_1.NotFoundException('Post Does Not Exists');
        if (req.body.tags?.length && (await this._userModel.find({ filter: { _id: { $in: req.body.tags } } })).length !== req.body.tags.length) {
            throw new errorHandling_utils_1.NotFoundException('some mentioned user not found');
        }
        let attachment = [];
        let asssestFolderId = (0, uuid_1.v4)();
        if (req.files?.length) {
            attachment = await (0, s3_config_1.uploadFiles)({
                files: req.files,
                path: `users/${post.createdAt}/post/${post.asssestFolderId}`
            });
        }
        const [comment] = (await this._commentModel.create({
            data: [
                {
                    ...req.body,
                    attachment,
                    postId,
                    createdBy: req.user?._id
                }
            ]
        })) || [];
        if (!comment) {
            if (attachment.length) {
                await (0, s3_config_1.deleteFiles)({ Urls: attachment, Quiet: false });
            }
            throw new errorHandling_utils_1.BadRequestException('Fail to Create Comment');
        }
        return res.status(201).json({ message: 'Comment Added Successfully', comment });
    };
}
exports.default = new CommentService;
