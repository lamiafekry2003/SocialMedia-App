"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.likePostSchema = exports.updatePostSchema = exports.createPostSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
const post_model_1 = require("../../DB/Models/post.model");
const cloud_multer_1 = require("../../Utils/multer/cloud.multer");
exports.createPostSchema = {
    body: zod_1.default.strictObject({
        content: zod_1.default.string().min(2).max(500000).optional(),
        attachment: zod_1.default.array(validation_middleware_1.generalFiled.file(cloud_multer_1.fileValidation.image)).max(5).optional(),
        allowComment: zod_1.default.enum(post_model_1.AllowCommentEnum).default(post_model_1.AllowCommentEnum.ALLOW),
        availabilty: zod_1.default.enum(post_model_1.AvailabilityEnum).default(post_model_1.AvailabilityEnum.PUBLIC),
        tags: zod_1.default.array(validation_middleware_1.generalFiled.id).max(10).optional(),
    }).superRefine((data, ctx) => {
        if (!data.attachment?.length && !data.content) {
            ctx.addIssue({
                code: 'custom',
                path: ['content'],
                message: 'Please Add Content Or Attachment '
            });
        }
        if (data.tags?.length && data.tags.length !== [...new Set(data.tags)].length) {
            ctx.addIssue({
                code: 'custom',
                path: ['tags'],
                message: 'please add unique id'
            });
        }
    })
};
exports.updatePostSchema = {
    params: zod_1.default.strictObject({
        postId: validation_middleware_1.generalFiled.id
    }),
    body: zod_1.default.strictObject({
        content: zod_1.default.string().min(2).max(500000).optional(),
        attachment: zod_1.default.array(validation_middleware_1.generalFiled.file(cloud_multer_1.fileValidation.image)).max(5).optional(),
        allowComment: zod_1.default.enum(post_model_1.AllowCommentEnum).default(post_model_1.AllowCommentEnum.ALLOW),
        availabilty: zod_1.default.enum(post_model_1.AvailabilityEnum).default(post_model_1.AvailabilityEnum.PUBLIC),
        tags: zod_1.default.array(validation_middleware_1.generalFiled.id).max(10).optional(),
        removeTags: zod_1.default.array(validation_middleware_1.generalFiled.id).max(10).optional(),
        removeAttachment: zod_1.default.array(zod_1.default.string()).max(10).optional()
    }).superRefine((data, ctx) => {
        if (!data.attachment?.length && !data.content) {
            ctx.addIssue({
                code: 'custom',
                path: ['content'],
                message: 'Please Add Content Or Attachment '
            });
        }
        if (data.tags?.length && data.tags.length !== [...new Set(data.tags)].length) {
            ctx.addIssue({
                code: 'custom',
                path: ['tags'],
                message: 'please add unique id'
            });
        }
        if (data.removeTags?.length && data.removeTags.length !== [...new Set(data.tags)].length) {
            ctx.addIssue({
                code: 'custom',
                path: ['tags'],
                message: 'please remove unique id'
            });
        }
    })
};
exports.likePostSchema = {
    params: zod_1.default.strictObject({
        postId: validation_middleware_1.generalFiled.id
    }),
    query: zod_1.default.strictObject({
        action: zod_1.default.enum(post_model_1.ActionEnum).default(post_model_1.ActionEnum.LIKE),
        paranoid: zod_1.default.boolean().optional()
    })
};
