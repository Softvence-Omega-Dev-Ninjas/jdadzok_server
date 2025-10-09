import { InjectQueue } from "@nestjs/bullmq";
import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { TUser } from "@project/@types";
import { MailService } from "@project/lib/mail/mail.service";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { OptService } from "@project/lib/utils/otp.service";
import { UtilsService } from "@project/lib/utils/utils.service";
import { QUEUE_JOB_NAME } from "@project/main/(buill-queue)/constants";
import { VerifyTokenDto } from "@project/main/(started)/auth/dto/verify-token.dto";
import { JwtServices } from "@project/services/jwt.service";
import { omit } from "@utils/index";
import { Queue } from "bullmq";
import { ResentOtpDto } from "./dto/resent-otp.dto";
import { CreateUserDto, UpdateUserDto } from "./dto/users.dto";
import { UserRepository } from "./users.repository";

@Injectable()
export class UserService {
    constructor(
        @InjectQueue("users") private readonly userQueue: Queue,
        private readonly repository: UserRepository,
        private readonly prisma: PrismaService,
        private readonly utilsService: UtilsService,
        private readonly jwtService: JwtServices,
        private readonly otpService: OptService,
        private readonly mailService: MailService,
    ) {}

    async register(body: CreateUserDto) {
        // has password if provider is email
        if (body.authProvider === "EMAIL") {
            if (!body.password)
                throw new ConflictException("Password is required for email registration");

            body.password = await this.utilsService.hash(body.password);
        }
        // if they select any other provider, we will not store password
        if (body.authProvider !== "EMAIL") delete body.password;
        // skip creating account now.
        const { user, hasAccount } = await this.repository.store(body);

        if (!user["isVerified"]) {
            // send otp again
            await this.userQueue.add(QUEUE_JOB_NAME.MAIL.SEND_OTP, {
                email: body.email,
                userId: user.id,
            });
            // return with mail verification
            return {
                user: omit(user, ["password"]),
                hasAccount,
            };
        }

        this.userQueue.add(QUEUE_JOB_NAME.MAIL.SEND_OTP, {
            email: body.email,
            userId: user.id,
        });

        const accessToken = await this.jwtService.signAsync({
            email: user.email,
            sub: user.id,
            roles: user.role,
        });

        return {
            accessToken,
            user: omit(user, ["password"]),
            hasAccount,
        };
    }

    async verifyOpt(input: VerifyTokenDto) {
        const user = await this.repository.findById(input.userId);
        if (!user) throw new NotFoundException("User not found with that ID");

        if (user.isVerified) throw new ConflictException("Account already verified!");
        await this.otpService.verifyOtp({
            userId: user.id,
            token: input.token,
            type: "EMAIL_VERIFICATION",
        });

        // Update DB
        const updatedUser = await this.repository.update(input.userId, {
            isVerified: true,
        });
        // when user account verified then we will have to send create a token and send it to as response
        const accessToken = await this.jwtService.signAsync({
            sub: user.id,
            roles: user.role,
            email: user.email,
        });
        return { user: omit(updatedUser, ["password"]), accessToken };
    }

    async resnetOtp(input: ResentOtpDto) {
        const user = await this.repository.findByEmail(input.email);
        if (!user) throw new NotFoundException("User not found with that email");

        // again send their otp
        const otp = await this.sendOtpMail({ userId: user.id, email: user.email });
        return otp;
    }

    async updateUser(userId: string, input: UpdateUserDto) {
        const user = await this.repository.findById(userId);
        if (!user) throw new NotFoundException("User not found!"); // not required for all the time
        // if update input has password then hash it
        if (input.password) input.password = await this.utilsService.hash(input.password!);

        return await this.repository.update(userId, input);
    }

    async deleteAcount(userId: string) {
        const user = await this.repository.findById(userId);
        if (!user) throw new NotFoundException("User not found!");

        await this.repository.delete(userId);
    }

    async getMe(userId: string) {
        return await this.repository.findById(userId);
    }

    async sendOtpMail(user: Omit<TUser, "role">) {
        // make same innital email validation for send email
        if (!user.email.endsWith("@gmail.com"))
            throw new BadRequestException("Email must end with @gmail.com");
        const otp = await this.otpService.generateOtp({
            userId: user.userId,
            email: user.email,
            type: "EMAIL_VERIFICATION",
        });

        await this.mailService.sendMail(
            user.email,
            "Please verify your email with that otp",
            "otp",
            { otp: otp.token },
        );

        return otp;
    }

    async followUser(followerId: string, followedId: string) {
        if (followerId === followedId) {
            throw new Error("Cannot follow userself");
        }

        const [follower, following] = await Promise.all([
            this.prisma.user.findUnique({ where: { id: followerId } }),
            this.prisma.user.findUnique({ where: { id: followedId } }),
        ]);

        // Check user exis with id
        if (!follower || !following) {
            throw new Error("Invalid user");
        }

        // Check already follow
        const userFollow = await this.prisma.userFollow.findUnique({
            where: {
                followerId_followedId: {
                    followerId,
                    followedId,
                },
            },
        });

        if (userFollow) {
            throw new Error("already following...");
        }

        return await this.prisma.$transaction([
            this.prisma.userFollow.create({
                data: {
                    followerId,
                    followedId,
                },

                select: {
                    follower: { select: { id: true } },
                    followed: { select: { id: true } },
                    createdAt: true,
                },
            }),
            this.prisma.profile.update({
                where: { userId: followerId },
                data: {
                    followingCount: { increment: 1 },
                },
            }),
            this.prisma.profile.update({
                where: {
                    userId: followerId,
                },
                data: {
                    followersCount: { increment: 1 },
                },
            }),
        ]);
    }
    async unfollowUser(followerId: string, followedId: string) {
        const userFollow = await this.prisma.userFollow.findUnique({
            where: {
                followerId_followedId: {
                    followerId,
                    followedId,
                },
            },
        });

        if (!userFollow) {
            throw new Error("Unknown user");
        }

        return await this.prisma.$transaction([
            this.prisma.userFollow.delete({
                where: {
                    followerId_followedId: {
                        followerId,
                        followedId,
                    },
                },
            }),
            this.prisma.profile.update({
                where: {
                    userId: followerId,
                },
                data: {
                    followingCount: { decrement: 1 },
                },
            }),
            this.prisma.profile.update({
                where: {
                    userId: followedId,
                },
                data: {
                    followersCount: { decrement: 1 },
                },
            }),
        ]);
    }
}
