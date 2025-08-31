import { Controller, Get, Post } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { CapLevelService } from "./cap-lavel.service";

@ApiBearerAuth()
@Controller("cap-level")
export class CapLevelController {
  constructor(private readonly service: CapLevelService) {}

  @Post()
  async store() {
    try {
      // code will here
      return "store";
    } catch (err) {
      return err;
    }
  }

  @Get()
  async index() {
    try {
      // code will here
      return "get all";
    } catch (err) {
      return err;
    }
  }
}
