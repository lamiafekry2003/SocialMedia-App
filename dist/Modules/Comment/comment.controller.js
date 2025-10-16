"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_middleware_1 = require("../../Middlewares/authentication.middleware");
const comment_authorization_1 = require("./comment.authorization");
const comment_service_1 = __importDefault(require("./comment.service"));
const cloud_multer_1 = require("../../Utils/multer/cloud.multer");
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
const comment_validation_1 = require("./comment.validation");
const router = (0, express_1.Router)({ mergeParams: true });
router.post('/add-comment', (0, cloud_multer_1.cloudFileUpload)({ validation: cloud_multer_1.fileValidation.image, storageApproch: cloud_multer_1.StorageEnum.MEMORY }).array('attachment', 5), (0, validation_middleware_1.validation)(comment_validation_1.addCommentSchema), (0, authentication_middleware_1.authentication)(comment_authorization_1.endPoint.createComment, authentication_middleware_1.TokenEnum.ACCESS), comment_service_1.default.addComment);
exports.default = router;
