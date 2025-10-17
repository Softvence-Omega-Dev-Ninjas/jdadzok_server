import { Controller } from "@nestjs/common";
import { FollowUnfollowService } from "./follow-unfollow.service";

@Controller("follow-unfollow")
export class FollowUnfollow {
    constructor(private readonly service: FollowUnfollowService) {}
}
