import { Injectable } from "@nestjs/common";
import { CreateCommunityDto } from "./dto/communities.dto";

@Injectable()
export class CommunitiesService {
  constructor() {}

  async createCommunity(userId: string, dto: CreateCommunityDto) {
    console.info(userId, dto);
    return "Create new community";
  }
}
