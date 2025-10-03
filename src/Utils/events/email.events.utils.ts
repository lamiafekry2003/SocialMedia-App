import { EventEmitter } from "events";
import { emailSubject, sendEmail } from "../email/sendEmail.utils";
import Mail from "nodemailer/lib/mailer";
import { template } from "../email/generatedEmail";

interface IEmail extends Mail.Options{
    otp:number,
    username:string,
    subject:string
}

export const emailEvent = new EventEmitter();
emailEvent.on("confirmEmail",async(date:IEmail)=>{
    await sendEmail({
        to:date.to,
        subject:emailSubject.confirmEmail,
        html:template(date.otp,date.username,date.subject)
    })
})