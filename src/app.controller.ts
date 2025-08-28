import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("App")
@Controller()
export class AppController {
  @ApiOkResponse({
    description: "Returns service health status",
    schema: {
      example: {
        status: "ok",
        timestamp: "2025-05-27T12:00:00.000Z",
      },
    },
  })
  @Get()
  async getHealth() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
