import { Controller } from "@nestjs/common";
import { NgoService } from "./ngo.service";

@Controller("ngos")
export class NgoController {
  constructor(private readonly service: NgoService) {}
}
