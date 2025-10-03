"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../../DB/Models/user.model");
const errorHandling_utils_1 = require("../../Utils/errorHandling/errorHandling.utils");
const user_repository_1 = require("../../DB/Reposatories/user.repository");
const hash_utils_1 = require("../../Utils/security/hash.utils");
const generateOTP_utils_1 = require("../../Utils/otp/generateOTP.utils");
const email_events_utils_1 = require("../../Utils/events/email.events.utils");
const token_utils_1 = require("../../Utils/token/token.utils");
class AuthenactionServices {
    _userModel = new user_repository_1.UserRepository(user_model_1.userModel);
    constructor() { }
    signUp = async (req, res, next) => {
        const { userName, email, password } = req.body;
        const userExist = await this._userModel.findOne({
            filter: { email },
            select: 'email',
            options: { lean: true }
        });
        if (userExist)
            throw new errorHandling_utils_1.ConflictException('User Already Exists');
        const hashPassword = await (0, hash_utils_1.generateHash)(password);
        const otp = (0, generateOTP_utils_1.generateOtp)();
        email_events_utils_1.emailEvent.emit('confirmEmail', { to: email, otp, username: userName, subject: 'Confirm your email' });
        const user = (await this._userModel.createUser({
            data: [
                {
                    userName,
                    email,
                    password: hashPassword,
                    confirmEmailOTP: await (0, hash_utils_1.generateHash)(String(otp))
                }
            ],
            options: {
                validateBeforeSave: true
            }
        })) || [];
        if (!user) {
            throw new errorHandling_utils_1.BadRequestException('failed to create user');
        }
        return res.status(201).json({ message: 'user created Successfully', user });
        return res.status(201).json({ message: 'user created Successfully' });
    };
    confirmEmail = async (req, res, next) => {
        const { email, otp } = req.body;
        const user = await this._userModel.findOne({
            filter: {
                email,
                confirmEmailOTP: { $exists: true },
                confirmedAt: { $exists: false }
            }
        });
        if (!user) {
            throw new errorHandling_utils_1.NotFoundException('invalid Account');
        }
        if (!user?.confirmEmailOTP || !(0, hash_utils_1.compareHash)(otp, user.confirmEmailOTP)) {
            throw new errorHandling_utils_1.BadRequestException('invalid OTP');
        }
        const updateUser = await this._userModel.updateOne({
            filter: { email },
            update: {
                confirmedAt: new Date(),
                $unset: { confirmEmailOTP: true }
            }
        });
        return res.status(200).json({ message: 'user Confirmed Successfully', updateUser });
    };
    login = async (req, res) => {
        const { email, password } = req.body;
        const user = await this._userModel.findOne({
            filter: { email },
        });
        if (!user) {
            throw new errorHandling_utils_1.NotFoundException('invalid Account');
        }
        if (!user.confirmedAt) {
            throw new errorHandling_utils_1.BadRequestException('please confirm your email');
        }
        if (!(0, hash_utils_1.compareHash)(password, user.password)) {
            throw new errorHandling_utils_1.BadRequestException('invalid password');
        }
        const accessToken = await (0, token_utils_1.generateToken)({ payload: { _id: user._id } });
        return res.status(200).json({ message: 'user logged in Successfully', accessToken });
    };
}
exports.default = new AuthenactionServices();
