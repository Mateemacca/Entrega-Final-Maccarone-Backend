import nodemailer from "nodemailer";
import config from "../config/config.js";
export default class MailingService {
  constructor() {
    this.client = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      auth: {
        user: "mateobauti.maccarone@gmail.com",
        pass: config.googlePassword,
      },
    });
  }
  sendSimpleMail = async ({ from, to, subject, html, attachments = [] }) => {
    const result = await this.client.sendMail({
      from,
      to,
      subject,
      html,
      attachments,
    });
    return result;
  };
}
