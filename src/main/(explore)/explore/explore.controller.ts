import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ExploreService } from "./explore.service";
import { ExploreDto } from "./dto/explore.dto";

@ApiTags("Explore")
@Controller("explore")
export class ExploreController {
    constructor(private readonly exploreService: ExploreService) {}

    @Get("top")
    @ApiOperation({ summary: "Get top communities and NGOs sorted by followers" })
    @ApiBearerAuth()
    async exploreTop(@Query() query: ExploreDto) {
        return this.exploreService.exploreTop(query.search);
    }
}
