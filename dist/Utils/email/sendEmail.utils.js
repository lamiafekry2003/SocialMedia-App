"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailSubject = exports.sendEmail = void 0;
const nodemailer_1 = require("nodemailer");
const sendEmail = async (date) => {
    const transporter = (0, nodemailer_1.createTransport)({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS
        }
    });
    const info = await transporter.sendMail({
        ...date,
        from: `"SocialMedia-App" <${process.env.EMAIL}>`,
    });
};
exports.sendEmail = sendEmail;
exports.emailSubject = {
    confirmEmail: "Confirm your email",
    resetPassword: "Reset your password",
    welcome: "Welcome to sara7a application",
};
