"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRevokedToken = exports.verifyToken = exports.createLoginCredentials = exports.getSignature = exports.getSignatureLevel = exports.generateToken = exports.LogoutEnum = exports.SignatureLevelEnum = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const user_model_1 = require("../../DB/Models/user.model");
const uuid_1 = require("uuid");
const token_repository_1 = require("../../DB/Reposatories/token.repository");
const token_model_1 = require("../../DB/Models/token.model");
const errorHandling_utils_1 = require("../errorHandling/errorHandling.utils");
var SignatureLevelEnum;
(function (SignatureLevelEnum) {
    SignatureLevelEnum["USER"] = "USER";
    SignatureLevelEnum["ADMIN"] = "ADMIN";
})(SignatureLevelEnum || (exports.SignatureLevelEnum = SignatureLevelEnum = {}));
var LogoutEnum;
(function (LogoutEnum) {
    LogoutEnum["ONLY"] = "ONLY";
    LogoutEnum["ALL"] = "ALL";
})(LogoutEnum || (exports.LogoutEnum = LogoutEnum = {}));
const generateToken = async ({ payload, secret = process.env.ACCESS_USER_SIGNATURE, options = {
    expiresIn: 60 * 60 * 24,
} }) => {
    return await (0, jsonwebtoken_1.sign)(payload, secret, options);
};
exports.generateToken = generateToken;
const getSignatureLevel = async (role = user_model_1.RoleEnum.USER) => {
    let signatureLevel = SignatureLevelEnum.USER;
    switch (role) {
        case user_model_1.RoleEnum.ADMIN:
            signatureLevel = SignatureLevelEnum.ADMIN;
            break;
        case user_model_1.RoleEnum.USER:
            signatureLevel = SignatureLevelEnum.USER;
        default:
            break;
    }
    return signatureLevel;
};
exports.getSignatureLevel = getSignatureLevel;
const getSignature = async (signatureLevel = SignatureLevelEnum.USER) => {
    let signature = { access_signature: '', refresh_signature: '' };
    switch (signatureLevel) {
        case SignatureLevelEnum.ADMIN:
            signature.access_signature = process.env.ACCESS_ADMIN_SIGNATURE;
            signature.refresh_signature = process.env.REFRESH_ADMIN_SIGNATURE;
            break;
        case SignatureLevelEnum.USER:
            signature.access_signature = process.env.ACCESS_USER_SIGNATURE;
            signature.refresh_signature = process.env.REFRESH_USER_SIGNATURE;
        default:
            break;
    }
    return signature;
};
exports.getSignature = getSignature;
const createLoginCredentials = async (user) => {
    const signatureLevel = await (0, exports.getSignatureLevel)(user.role);
    const signature = await (0, exports.getSignature)(signatureLevel);
    const jwtid = (0, uuid_1.v4)();
    const accessToken = await (0, exports.generateToken)({ payload: { _id: user._id }, secret: signature.access_signature, options: {
            expiresIn: Number(process.env.ACCESS_EXPIRES_IN),
            jwtid
        } });
    const refreshToken = await (0, exports.generateToken)({ payload: { _id: user._id }, secret: signature.refresh_signature, options: {
            expiresIn: Number(process.env.REFRESH_EXPIRES_IN),
            jwtid
        } });
    return { accessToken, refreshToken };
};
exports.createLoginCredentials = createLoginCredentials;
const verifyToken = async ({ token, secret = process.env.ACCESS_USER_SIGNTURE }) => {
    return await (0, jsonwebtoken_1.verify)(token, secret);
};
exports.verifyToken = verifyToken;
const createRevokedToken = async (decoded) => {
    const tokenMode = new token_repository_1.TokenRepository(token_model_1.tokenModel);
    const [result] = (await tokenMode.create({
        data: [{
                jti: decoded?.jti,
                expireIn: decoded?.iat + Number(process.env.REFRESH_EXPIRES_IN),
                userId: decoded?._id
            }],
        options: {
            validateBeforeSave: true
        }
    })) || [];
    if (!result)
        throw new errorHandling_utils_1.BadRequestException('Failed to revoke token');
    return result;
};
exports.createRevokedToken = createRevokedToken;
