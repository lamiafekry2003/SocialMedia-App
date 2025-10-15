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
        if (req.body.tags?.length && (await this._userModel.find({ filter: { _id: { $in: req.body.tags } } })).length) {
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
}
exports.default = new PostService;
