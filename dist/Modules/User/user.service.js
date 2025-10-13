"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../../DB/Models/user.model");
const token_utils_1 = require("../../Utils/token/token.utils");
const user_repository_1 = require("../../DB/Reposatories/user.repository");
const s3_config_1 = require("../../Utils/multer/s3.config");
const cloud_multer_1 = require("../../Utils/multer/cloud.multer");
class UserServices {
    _userModel = new user_repository_1.UserRepository(user_model_1.userModel);
    constructor() { }
    getUser = async (req, res, next) => {
        return res.status(200).json({ message: 'user found successfully', user: req.user, decoded: req.decoded });
    };
    logout = async (req, res, next) => {
        const { flag } = req.body;
        let statusCode = 200;
        const update = {};
        switch (flag) {
            case token_utils_1.LogoutEnum.ALL:
                update.changeCredentialsTime = new Date();
                break;
            case token_utils_1.LogoutEnum.ONLY:
                await (0, token_utils_1.createRevokedToken)(req.decoded);
                statusCode: 201;
                break;
            default:
                break;
        }
        await this._userModel.updateOne({
            filter: { _id: req.decoded?._id },
            update
        });
        return res.status(statusCode).json({ message: 'user logout successfully' });
    };
    profileImage = async (req, res, next) => {
        const key = await (0, s3_config_1.uploadFile)({
            file: req.file,
            path: `users/${req.decoded?._id}/profileImage`
        });
        if (req.user && req.user.profileImage?.key) {
            await (0, s3_config_1.deleteFile)({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: req.user.profileImage.key,
            });
        }
        const user = await this._userModel.findOneAndUpdate({
            filter: { _id: req.user?._id },
            update: { profileImage: key },
        });
        return res.status(200).json({
            message: "Profile image uploaded successfully", data: user,
        });
    };
    profileCoverImage = async (req, res, next) => {
        const urls = await (0, s3_config_1.uploadFiles)({
            storageApproch: cloud_multer_1.StorageEnum.DISK,
            files: req.files,
            path: `user/${req?.decoded?._id}/coverImage`
        });
        const user = await this._userModel.findOneAndUpdate({
            filter: { _id: req.user?._id },
            update: {
                coverImages: { urls }
            },
            options: {
                new: true
            }
        });
        if (req.user?.coverImages?.urls?.length) {
            for (const oldKey of req.user.coverImages.urls) {
                if (oldKey) {
                    await (0, s3_config_1.deleteFiles)({
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Urls: [String(oldKey)],
                        Quiet: false,
                    });
                }
            }
        }
        return res.status(200).json({ message: 'cover image uploaded Successfully', data: user });
    };
    deleteImage = async (req, res, next) => {
        const { Key } = req.query;
        const result = await (0, s3_config_1.deleteFile)({
            Key: Key
        });
        return res.status(200).json({ message: 'Image deleted successfully', result });
    };
    deleteImages = async (req, res, next) => {
        const { Key } = req.query;
        const urls = Key.split(',').map((key) => key.trim());
        const result = await (0, s3_config_1.deleteFiles)({
            Urls: urls,
            Quiet: false,
        });
        return res.status(200).json({ message: 'Images deleted successfully', result });
    };
}
exports.default = new UserServices();
