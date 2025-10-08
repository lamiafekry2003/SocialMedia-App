"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../../DB/Models/user.model");
const token_utils_1 = require("../../Utils/token/token.utils");
const user_repository_1 = require("../../DB/Reposatories/user.repository");
class UserServices {
    _userModel = new user_repository_1.UserRepository(user_model_1.userModel);
    constructor() { }
    getUser = async (req, res, next) => {
        return res.status(200).json({ message: 'user found successfully', user: req.user, decoded: req.decoded });
    };
    logout = async (req, res, next) => {
        const { flag } = req.body;
        let statusCode = 200;
        const update = {};
        switch (flag) {
            case token_utils_1.LogoutEnum.ALL:
                update.changeCredentialsTime = new Date();
                break;
            case token_utils_1.LogoutEnum.ONLY:
                await (0, token_utils_1.createRevokedToken)(req.decoded);
                statusCode: 201;
                break;
            default:
                break;
        }
        await this._userModel.updateOne({
            filter: { _id: req.decoded?._id },
            update
        });
        return res.status(statusCode).json({ message: 'user logout successfully' });
    };
}
exports.default = new UserServices();
