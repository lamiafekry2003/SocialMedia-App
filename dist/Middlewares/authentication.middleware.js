"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication = exports.decodeToken = exports.TokenEnum = void 0;
const user_model_1 = require("../DB/Models/user.model");
const user_repository_1 = require("../DB/Reposatories/user.repository");
const errorHandling_utils_1 = require("../Utils/errorHandling/errorHandling.utils");
const token_utils_1 = require("../Utils/token/token.utils");
const token_model_1 = require("../DB/Models/token.model");
const token_repository_1 = require("../DB/Reposatories/token.repository");
var TokenEnum;
(function (TokenEnum) {
    TokenEnum["ACCESS"] = "ACCESS";
    TokenEnum["REFRESH"] = "REFRESH";
})(TokenEnum || (exports.TokenEnum = TokenEnum = {}));
const decodeToken = async ({ authorization, tokenType = TokenEnum.ACCESS, }) => {
    const userRepo = new user_repository_1.UserRepository(user_model_1.userModel);
    const tokenRepo = new token_repository_1.TokenRepository(token_model_1.tokenModel);
    const [bearer, token] = authorization.split(" ") || [];
    if (!bearer || !token) {
        throw new errorHandling_utils_1.unauthorizedException('Missing token parts');
    }
    const signature = await (0, token_utils_1.getSignature)(bearer);
    const decoded = await (0, token_utils_1.verifyToken)({ token,
        secret: tokenType === TokenEnum.REFRESH ? signature.refresh_signature : signature.access_signature
    });
    if (!decoded._id || !decoded?.iat) {
        throw new errorHandling_utils_1.unauthorizedException('Invalid token payload');
    }
    ;
    if (await tokenRepo.findOne({ filter: { jti: decoded.jti } })) {
        throw new errorHandling_utils_1.unauthorizedException('invalid or old login Credentials');
    }
    const user = await userRepo.findOne({
        filter: { _id: decoded._id }
    });
    if (!user) {
        throw new errorHandling_utils_1.NotFoundException('Invalid token user');
    }
    if (user.changeCredentialsTime?.getTime() || 0 > decoded.iat * 100)
        throw new errorHandling_utils_1.unauthorizedException('invalid or old login Credentials');
    return { decoded, user };
};
exports.decodeToken = decodeToken;
const authentication = (accessRole = [], tokenType = TokenEnum.ACCESS) => {
    return async (req, res, next) => {
        if (!req.headers.authorization) {
            throw new errorHandling_utils_1.BadRequestException('Missing authorization header');
        }
        const { decoded, user } = await (0, exports.decodeToken)({ authorization: req.headers.authorization, tokenType });
        if (!accessRole.includes(user.role)) {
            throw new errorHandling_utils_1.ForbiddenException('You Are Not authorized to access this role');
        }
        req.user = user;
        req.decoded = decoded;
        next();
    };
};
exports.authentication = authentication;
