import { Injectable } from "@nestjs/common";
import { CapLevelRepository } from "./cap-lavel.repository";

@Injectable()
export class CapLevelService {
  constructor(private readonly repository: CapLevelRepository) {}

  async create() {}
  async index() {}
}
