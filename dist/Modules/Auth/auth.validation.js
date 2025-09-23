"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUpSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
exports.signUpSchema = {
    body: zod_1.default.strictObject({
        username: validation_middleware_1.generalFiled.username,
        email: validation_middleware_1.generalFiled.email,
        password: validation_middleware_1.generalFiled.password,
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
