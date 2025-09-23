"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthenactionServices {
    signUp = async (req, res, next) => {
        return res.status(201).json({ message: 'user created Successfully' });
    };
    login = (req, res) => {
        return res.status(200).json({ message: 'user logged in Successfully' });
    };
}
exports.default = new AuthenactionServices();
