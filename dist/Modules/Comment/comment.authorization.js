"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endPoint = void 0;
const user_model_1 = require("../../DB/Models/user.model");
exports.endPoint = {
    createComment: [user_model_1.RoleEnum.ADMIN, user_model_1.RoleEnum.USER]
};
