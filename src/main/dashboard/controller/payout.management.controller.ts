import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Payout-management")
@Controller("admin/payoutManagement")
export class PayoutManagementController {}
