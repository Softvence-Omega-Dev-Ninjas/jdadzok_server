import { registerAs } from "@nestjs/config";
import { JwtModuleOptions } from "@nestjs/jwt";

const expiresIn = Number(process.env.JWT_EXPIRES_IN) ?? 90
export default registerAs(
    "jwt",
    (): JwtModuleOptions => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
            expiresIn
        },
    }),
);
