"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = __importDefault(require("./auth.service"));
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
const auth_validation_1 = require("./auth.validation");
const authentication_middleware_1 = require("../../Middlewares/authentication.middleware");
const auth_authorization_1 = require("./auth.authorization");
const router = (0, express_1.Router)();
router.post('/signup', (0, validation_middleware_1.validation)(auth_validation_1.signUpSchema), auth_service_1.default.signUp);
router.post('/login', (0, validation_middleware_1.validation)(auth_validation_1.loginSchema), auth_service_1.default.login);
router.patch('/confirmEmail', (0, validation_middleware_1.validation)(auth_validation_1.confirmEmailSchema), auth_service_1.default.confirmEmail);
router.post('/refresh-token', (0, authentication_middleware_1.authentication)(auth_authorization_1.endPoint.refreshToken, authentication_middleware_1.TokenEnum.REFRESH), auth_service_1.default.refreshToken);
exports.default = router;
