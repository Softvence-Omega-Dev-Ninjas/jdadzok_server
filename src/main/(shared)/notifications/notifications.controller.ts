import { TUser } from "@app/@types";
import { GetUser, Roles } from "@app/common/jwt/jwt.decorator";
import { JwtAuthGuard } from "@app/main/(started)/auth/guards/jwt-auth";
import { Controller, Put, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";

@Controller("notifications")
export class NotificaitonsController {
    constructor() {}

    @UseGuards(JwtAuthGuard)
    async fetchSystemAdminNotificaiton(@GetUser() user: TUser) {
        try {
            console.info(user);
            return "system admin notificaiton";
        } catch (err) {
            return err;
        }
    }

    @Put("mark-as-read")
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    async markAsRead(@GetUser() user: TUser) {
        try {
            console.info(user);
            return "make as reads";
        } catch (err) {
            return err;
        }
    }
}
