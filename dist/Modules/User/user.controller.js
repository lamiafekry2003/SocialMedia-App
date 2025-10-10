"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_service_1 = __importDefault(require("./user.service"));
const authentication_middleware_1 = require("../../Middlewares/authentication.middleware");
const user_authorization_1 = require("./user.authorization");
const cloud_multer_1 = require("../../Utils/multer/cloud.multer");
const router = (0, express_1.Router)();
router.get('/profile', (0, authentication_middleware_1.authentication)(user_authorization_1.endPoint.profile), user_service_1.default.getUser);
router.delete('/logout', (0, authentication_middleware_1.authentication)(user_authorization_1.endPoint.logout), user_service_1.default.logout);
router.patch('/profile-image', (0, authentication_middleware_1.authentication)(user_authorization_1.endPoint.image), (0, cloud_multer_1.cloudFileUpload)({ validation: cloud_multer_1.fileValidation.image, maxSize: 2, storageApproch: cloud_multer_1.StorageEnum.MEMORY }).single('profileImage'), user_service_1.default.profileImage);
router.patch('/cover-image', (0, authentication_middleware_1.authentication)(user_authorization_1.endPoint.image), (0, cloud_multer_1.cloudFileUpload)({ validation: cloud_multer_1.fileValidation.image, maxSize: 2, storageApproch: cloud_multer_1.StorageEnum.MEMORY }).array('coverImage', 5), user_service_1.default.profileCoverImage);
exports.default = router;
