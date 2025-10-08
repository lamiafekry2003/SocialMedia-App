"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const token_utils_1 = require("../../Utils/token/token.utils");
exports.logoutSchema = {
    body: zod_1.default.strictObject({
        flag: zod_1.default.enum(token_utils_1.LogoutEnum).default(token_utils_1.LogoutEnum.ONLY)
    })
};
