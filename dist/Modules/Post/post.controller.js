"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const post_service_1 = __importDefault(require("./post.service"));
const authentication_middleware_1 = require("../../Middlewares/authentication.middleware");
const post_authorization_1 = require("./post.authorization");
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
const post_validation_1 = require("./post.validation");
const cloud_multer_1 = require("../../Utils/multer/cloud.multer");
const router = (0, express_1.Router)();
router.post('/', (0, cloud_multer_1.cloudFileUpload)({ validation: cloud_multer_1.fileValidation.image, storageApproch: cloud_multer_1.StorageEnum.MEMORY }).array('attachment', 5), (0, validation_middleware_1.validation)(post_validation_1.createPostSchema), (0, authentication_middleware_1.authentication)(post_authorization_1.endPoint.createPost, authentication_middleware_1.TokenEnum.ACCESS), post_service_1.default.createPost);
exports.default = router;
