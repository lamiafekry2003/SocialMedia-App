"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalFiled = exports.validation = void 0;
const errorHandling_utils_1 = require("../Utils/errorHandling/errorHandling.utils");
const zod_1 = __importDefault(require("zod"));
const mongoose_1 = require("mongoose");
const validation = (schema) => {
    return (req, res, next) => {
        const validationError = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            if (req.file)
                req.body.attachment = req.file;
            if (req.files) {
                req.body.attachment = req.files;
            }
            const validationResults = schema[key].safeParse(req[key]);
            if (!validationResults.success) {
                const error = validationResults.error;
                validationError.push({
                    key,
                    issues: error.issues.map((issue) => {
                        return {
                            message: issue.message,
                            path: issue.path,
                        };
                    }),
                });
            }
            if (validationError.length > 0) {
                throw new errorHandling_utils_1.BadRequestException("validation Error", {
                    cause: validationError,
                });
            }
        }
        return next();
    };
};
exports.validation = validation;
exports.generalFiled = {
    username: zod_1.default
        .string({
        error: "username is required",
    })
        .min(2, {
        error: "must at least 2 ",
    })
        .max(25, {
        error: "must at most 25",
    }),
    email: zod_1.default.email({
        error: "email is required",
    }),
    password: zod_1.default.string({ error: "password is required" }),
    confirmPassword: zod_1.default.string({ error: "confirm password is required" }),
    otp: zod_1.default.string().regex(/^\d{6}/),
    file: function (mimetype) {
        return zod_1.default.strictObject({
            fieldname: zod_1.default.string(),
            originalname: zod_1.default.string(),
            encoding: zod_1.default.string(),
            mimetype: zod_1.default.string(),
            buffer: zod_1.default.any().optional(),
            path: zod_1.default.string().optional(),
            size: zod_1.default.number()
        }).refine((data) => {
            return data.buffer || data.path;
        }, { error: 'please provide a file' });
    },
    id: zod_1.default.string().refine((data) => {
        return mongoose_1.Types.ObjectId.isValid(data);
    }, { error: 'invaild tag id' })
};
