"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEvent = void 0;
const events_1 = require("events");
const sendEmail_utils_1 = require("../email/sendEmail.utils");
const generatedEmail_1 = require("../email/generatedEmail");
exports.emailEvent = new events_1.EventEmitter();
exports.emailEvent.on("confirmEmail", async (date) => {
    await (0, sendEmail_utils_1.sendEmail)({
        to: date.to,
        subject: sendEmail_utils_1.emailSubject.confirmEmail,
        html: (0, generatedEmail_1.template)(date.otp, date.username, date.subject)
    });
});
