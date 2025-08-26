import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ENVEnum } from "@project/common/enum/env.enum";
import { RESET_TOKEN_EXPIRES_IN } from "@project/constants";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: this.configService.getOrThrow<string>(ENVEnum.MAIL_USER),
        pass: this.configService.getOrThrow<string>(ENVEnum.MAIL_PASS),
      },
    });
  }

  async sendLoginCodeEmail(
    email: string,
    code: string,
  ): Promise<nodemailer.SentMessageInfo> {
    const mailOptions = {
      from: `"No Reply" <${this.configService.get<string>(ENVEnum.MAIL_USER)}>`,
      to: email,
      subject: "Login Code",
      html: `
        <h3>Welcome!</h3>
        <p>Please login by using the code below:</p>
        <p>Your login code is ${code}</p>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendEmail(
    email: string,
    subject: string,
    message: string,
  ): Promise<nodemailer.SentMessageInfo> {
    const mailOptions = {
      from: `"No Reply" <${this.configService.get<string>(ENVEnum.MAIL_USER)}>`,
      to: email,
      subject,
      html: message,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async forgetPasswordMail(
    email: string,
    code: string,
  ): Promise<nodemailer.SentMessageInfo> {
    const mailOptions = {
      from: `"No Reply" <${this.configService.get<string>(ENVEnum.MAIL_USER)}>`,
      to: email,
      subject: "Forgot Password",
      html: `
        <h3>Reset Your Password</h3>
        <p>Please use the code below to reset your password:</p>
        <p>Your reset code is <b>${code}</b></p>
        <p style="color: red">This code will expire within ${RESET_TOKEN_EXPIRES_IN / 1000 / 60} minutes</p>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }
}
