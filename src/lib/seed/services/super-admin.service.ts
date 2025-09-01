import { faker } from "@faker-js/faker";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ENVEnum } from "@project/common/enum/env.enum";
import { UserEnum } from "@project/common/enum/user.enum";
import { PrismaService } from "@project/lib/prisma/prisma.service";
import { UtilsService } from "@project/lib/utils/utils.service";
import chalk from "chalk";

@Injectable()
export class SuperAdminService implements OnModuleInit {
  private superAdminEmail: string;
  private superAdminPass: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
    private readonly configService: ConfigService,
  ) {
    this.superAdminEmail = this.configService.getOrThrow<string>(
      ENVEnum.SUPER_ADMIN_EMAIL,
    );
    this.superAdminPass = this.configService.getOrThrow<string>(
      ENVEnum.SUPER_ADMIN_PASS,
    );
  }

  async onModuleInit() {
    // Seed super admin if it doesn't exist
    await this.seedSuperAdminUser();
    // Seed regular users only if no users exist
    await this.seedUsersOnce();
  }

  /**
   * Check if the Super Admin user exists. If not, create it.
   */
  private async seedSuperAdminUser(): Promise<void> {
    const superAdminExists = await this.checkIfUserExists(this.superAdminEmail);

    if (!superAdminExists) {
      await this.createSuperAdminUser();
    } else {
      console.info(
        chalk.bgGreen.white.bold(
          `🚀 Super Admin user already exists with email: ${this.superAdminEmail}`,
        ),
      );
    }
  }

  /**
   * Checks if a user already exists by their email.
   * @param email - The email of the user to check.
   * @returns {Promise<boolean>}
   */
  private async checkIfUserExists(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return Boolean(user); // Returns true if user exists, false otherwise
  }

  /**
   * Create the Super Admin user.
   */
  private async createSuperAdminUser(): Promise<void> {
    const passwordHash = await this.hashPassword(this.superAdminPass);

    await this.prisma.user.create({
      data: {
        email: this.superAdminEmail,
        passwordHash,
        authProvider: "EMAIL",
        role: UserEnum.SUPER_ADMIN,
      },
    });

    console.info(
      chalk.bgGreen.white.bold(
        `🚀 Super Admin user created with email: ${this.superAdminEmail}`,
      ),
    );
  }

  private async hashPassword(password: string): Promise<string> {
    return await this.utils.hash(password);
  }

  /**
   * Seed regular users if no users exist.
   */
  private async seedUsersOnce(): Promise<void> {
    const existingUsersCount = await this.prisma.user.count();

    if (existingUsersCount <= 1) {
      await this.createUsers();
    } else {
      console.info(
        chalk.bgYellow.white.bold("⚠️ Users already exist, skipping seeding."),
      );
    }
  }

  /**
   * Creates multiple regular users.
   */
  private async createUsers(): Promise<void> {
    const users = await this.generateRandomUsers(5); // Generate 5 random users

    // Bulk create users with password hashing
    await this.prisma.user.createMany({
      data: users,
      skipDuplicates: true,
    });

    console.info(chalk.bgBlue.white.bold("🚀 Regular users seeded!"));
  }

  /**
   * Generates an array of random user objects.
   * @param count - The number of users to generate.
   */
  private async generateRandomUsers(count: number): Promise<any[]> {
    // Use Promise.all to ensure all promises are resolved before returning the result
    const users = await Promise.all(
      Array.from({ length: count }, async () => ({
        email: faker.internet.email(),
        passwordHash: await this.hashPassword("pass123"), // Hashing passwords
        authProvider: faker.helpers.arrayElement(["EMAIL"] as const),
      })),
    );

    return users;
  }
}
