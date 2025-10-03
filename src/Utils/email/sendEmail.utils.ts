import Mail from "nodemailer/lib/mailer";
import { createTransport, Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export const sendEmail = async(date:Mail.Options):Promise<void> =>{
    const transporter:Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options> =createTransport({
        service:'gmail',
        auth:{
            user:process.env.EMAIL,
            pass:process.env.PASS
        }
    })
    const info:SMTPTransport.SentMessageInfo = await transporter.sendMail({
        ...date,
        from: `"SocialMedia-App" <${process.env.EMAIL}>`,
    })
}
export const emailSubject = {
  confirmEmail: "Confirm your email",
  resetPassword: "Reset your password",
  welcome: "Welcome to sara7a application",
  
};