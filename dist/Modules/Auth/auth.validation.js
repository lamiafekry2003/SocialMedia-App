"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmEmailSchema = exports.signUpSchema = exports.loginSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
exports.loginSchema = {
    body: zod_1.default.strictObject({
        email: validation_middleware_1.generalFiled.email,
        password: validation_middleware_1.generalFiled.password
    })
};
exports.signUpSchema = {
    body: exports.loginSchema.body.extend({
        userName: validation_middleware_1.generalFiled.username,
        confirmPassword: validation_middleware_1.generalFiled.confirmPassword
    }).superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: 'custom',
                path: ['confirmPassword'],
                message: 'password mis match'
            });
        }
    })
};
exports.confirmEmailSchema = {
    body: zod_1.default.strictObject({
        email: validation_middleware_1.generalFiled.email,
        otp: validation_middleware_1.generalFiled.otp
    })
};
