// import {
//   ForbiddenException,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// // import { LoginAuthDto } from './dto/login-auth.dto';
// // import { DbService } from 'src/utils/db/db.service';
// // import { LibService } from 'src/utils/lib/lib.service';
// // import { RegisterAuthDto } from './dto/register-auth.dto';
// // import { ForgetPasswordAuthDto } from './dto/forget-passord.dto';
// // import { ResetPasswordAuthDto } from './dto/reset-password.dto';
// // import { ChangePasswordAuthDto } from './dto/change-password.dto';
// // import { VerifyOtpAuthDto } from './dto/verify-password.dto';
// import { JwtService } from '@nestjs/jwt';
// // import { MailService } from 'src/utils/mail/mail.service';
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class AuthService {
//   constructor(
//     private readonly dbService: DbService,
//     private readonly libService: LibService,
//     private readonly jwtService: JwtService,
//     private readonly mailService: MailService,
//     private readonly config: ConfigService,
//   ) { }

//   async login(payload: LoginAuthDto) {
//     const user = await this.dbService.user.findUnique({
//       where: { email: payload.email },
//     });
//     if (!user) {
//       throw new NotFoundException('User not exist!');
//     }

//     const matched = await this.libService.comparePassword({
//       hashedPassword: user.password,
//       password: payload.password,
//     });
//     if (!matched) {
//       throw new ForbiddenException('Email or Password Invalid!');
//     }

//     const jwtPayload = {
//       id: user.id,
//       role: user.role,
//     };

//     const accessToken = await this.jwtService.signAsync(jwtPayload);

//     return {
//       accessToken,
//       user: {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//       },
//     };
//   }

//   async register(payload: RegisterAuthDto) {
//     const user = await this.dbService.user.findUnique({
//       where: {
//         email: payload.email,
//       },
//     });
//     if (user) {
//       throw new ForbiddenException('User already exists!');
//     }

//     payload.password = await this.libService.hashPassword({
//       password: payload.password,
//     });

//     const userData = await this.dbService.user.create({
//       data: payload,
//     });

//     const jwtPayload = {
//       id: userData.id,
//     };

//     const accessToken = await this.jwtService.signAsync(jwtPayload);

//     return {
//       accessToken,
//       user: {
//         id: userData.id,
//         email: userData.email,
//       },
//     };
//   }

//   async forgetPassword(payload: ForgetPasswordAuthDto) {
//     const user = await this.dbService.user.findUnique({
//       where: {
//         email: payload.email,
//       },
//     });

//     if (!user) {
//       throw new NotFoundException('User not exists!');
//     }

//     const generatedOtp = this.mailService.generateNumericCode(6);

//     await this.dbService.user.update({
//       where: { id: user.id },
//       data: {
//         otp: generatedOtp,
//       },
//     });

//     const text = `
//       You requested to reset your password.

//       Your OTP (One-Time Password) is: ${generatedOtp}

//       Please enter this code in the app to complete your password reset.

//       This code is valid for the next 10 minutes. If you did not request this, please ignore this email.
//     `;
//     const html = `
//       <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
//         <p>You requested to reset your password.</p>
//         <p><strong>Your OTP (One-Time Password) is:</strong></p>
//         <div style="font-size: 20px; font-weight: bold; margin: 10px 0; color: #2c3e50;">${generatedOtp}</div>
//         <p>Please enter this code in the app to complete your password reset.</p>
//         <p style="color: #999;">This code is valid for the next 10 minutes.</p>
//         <p>If you did not request this, please ignore this email.</p>
//       </div>
//     `;

//     await this.mailService.sendMail(
//       user.email,
//       'Password Reset OTP',
//       text,
//       html,
//     );

//     //generate jwt token
//     const jwtPayload = {
//       id: user.id,
//     };

//     const resetToken = await this.jwtService.signAsync(jwtPayload, {
//       expiresIn: '10m',
//     });

//     return {
//       resetToken,
//     };
//   }

//   async verifyOtp(payload: VerifyOtpAuthDto) {
//     const isVerified = await this.jwtService.verifyAsync(payload.resetToken);

//     if (!isVerified) {
//       throw new ForbiddenException('Invalid token!');
//     }

//     const decode = await this.jwtService.decode(payload.resetToken);
//     const user = await this.dbService.user.findUnique({
//       where: {
//         id: decode.id,
//       },
//     });

//     if (!user) {
//       throw new ForbiddenException('Something went wrong, try again!');
//     }

//     if (user.otp !== payload.otp) {
//       throw new ForbiddenException('OTP not matched!');
//     }

//     await this.dbService.user.update({
//       where: { id: user.id },
//       data: {
//         otp: null,
//       },
//     });

//     const jwtPayload = {
//       id: user.id,
//     };

//     // generate token
//     const resetToken = await this.jwtService.signAsync(jwtPayload, {
//       expiresIn: this.config.getOrThrow('RESET_TOKEN_EXPIRES_IN'),
//     });

//     return {
//       resetToken,
//     };
//   }

//   async resetPassword(payload: ResetPasswordAuthDto) {
//     const isVerified = await this.jwtService.verifyAsync(payload.resetToken);

//     if (!isVerified) {
//       throw new ForbiddenException('Invalid token!');
//     }
//     // decode token
//     const decode = await this.jwtService.decode(payload.resetToken);
//     const user = await this.dbService.user.findUnique({
//       where: {
//         id: decode.id,
//       },
//     });

//     if (!user) {
//       throw new NotFoundException('Something went wrong!');
//     }

//     const hashedPassword = await this.libService.hashPassword({
//       password: payload.password,
//     });

//     await this.dbService.user.update({
//       where: {
//         email: user.email,
//       },
//       data: {
//         password: hashedPassword,
//       },
//     });

//     return;
//   }

//   async changePassword(user, payload: ChangePasswordAuthDto) {
//     const userData = await this.dbService.user.findUnique({
//       where: {
//         id: user.id,
//       },
//     });

//     if (!userData) {
//       throw new NotFoundException('Something went wrong!');
//     }

//     const matched = await this.libService.comparePassword({
//       hashedPassword: userData.password,
//       password: payload.oldPassword,
//     });

//     if (!matched) {
//       throw new ForbiddenException('Old password not matched!');
//     }

//     const hashedPassword = await this.libService.hashPassword({
//       password: payload.password,
//     });

//     await this.dbService.user.update({
//       where: { id: user.id },
//       data: {
//         password: hashedPassword,
//       },
//     });

//     return;
//   }

//   async remove(user) {
//     const userData = await this.dbService.user.findUnique({
//       where: { id: user.id },
//     });

//     if (!userData) {
//       throw new NotFoundException('User not found!');
//     }

//     await this.dbService.user.delete({
//       where: { id: user.id },
//     });

//     return;
//   }
// }
