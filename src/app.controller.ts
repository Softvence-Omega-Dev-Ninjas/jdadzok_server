import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { RedisService } from "./common/redis/redis.service";

@ApiTags("App")
@Controller()
export class AppController {
  constructor(private redisService: RedisService) { }

  @Get()
  @ApiOkResponse({
    description: "Returns service health status",
    schema: {
      example: {
        status: "ok",
        timestamp: "2025-05-27T12:00:00.000Z",
      },
    },
  })
  async getHealth(): Promise<{ status: string; timestamp: string }> {

    const get1 = await this.redisService.get("USER_SESSION");
    console.log('last1', get1)
    await this.redisService.set("USER_SESSION", JSON.stringify({
      name: "sabbir",
      username: "sabbir123"
    }), "30s")
    console.log('set')
    const get = await this.redisService.get("USER_SESSION");
    console.log('last', get)
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
