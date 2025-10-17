import { Injectable } from "@nestjs/common";
import { FollowUnfollowRepository } from "./follow-unfollow.repository";

@Injectable()
export class FollowUnfollowService {
    constructor(private readonly repository: FollowUnfollowRepository) { }


}