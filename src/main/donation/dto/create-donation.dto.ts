import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class CreateDonationDto {
    @ApiProperty({
        description: "Amount to donate (in USD dollor)",
        example: 50.0,
    })
    @IsNumber()
    amount: number;
}
