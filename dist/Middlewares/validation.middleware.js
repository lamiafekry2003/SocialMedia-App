"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalFiled = exports.validation = void 0;
const errorHandling_utils_1 = require("../Utils/errorHandling/errorHandling.utils");
const zod_1 = __importDefault(require("zod"));
const validation = (schema) => {
    return (req, res, next) => {
        const validationError = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            const validationResults = schema[key].safeParse(req[key]);
            if (!validationResults.success) {
                const error = validationResults.error;
                validationError.push({
                    key,
                    issues: error.issues.map((issue) => {
                        return {
                            message: issue.message,
                            path: issue.path
                        };
                    })
                });
            }
            if (validationError.length > 0) {
                throw new errorHandling_utils_1.BadRequestException('validation Error', {
                    cause: validationError
                });
            }
        }
        return next();
    };
};
exports.validation = validation;
exports.generalFiled = {
    username: zod_1.default.string({
        error: 'username is required'
    }).min(2, {
        error: 'must at least 2 '
    }).max(25, {
        error: 'must at most 25'
    }),
    email: zod_1.default.email({
        error: 'email is required'
    }),
    password: zod_1.default.string({ error: 'password is required' }),
    confirmPassword: zod_1.default.string({ error: 'confirm password is required' }),
    otp: zod_1.default.string().regex(/^\d{6}/)
};
