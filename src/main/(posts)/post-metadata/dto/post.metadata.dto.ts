import { ApiProperty } from "@nestjs/swagger";
import { feelings, Feelings } from "@project/constants";
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from "class-validator";
// -----------------------------------
// POST METADATA DTO
// -----------------------------------
export class CreatePostMetadataDto {
  @ApiProperty({
    enum: feelings,
    example: ["HAPPY", "INSPIRED"],
    description: "Feelings associated with the post",
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray({
    context: feelings,
  })
  feelings?: Feelings[];

  @ApiProperty({
    example: "checkin-uuid-here",
    description: "Optional check-in location ID",
  })
  @IsOptional()
  @IsUUID()
  check_in_id?: string;

  @ApiProperty({
    example: "gif-uuid-here",
    description: "Optional gif ID",
    type: String,
    format: "uuid",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  gif_id?: string;
}

// -----------------------------------
// LOCATION DTO
// -----------------------------------
export class CreateLocationDto {
  @ApiProperty({
    example: "Central Park",
    description: "Name of the location",
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: "40.785091,-73.968285",
    description: "Coordinates of the location (latitude,longitude)",
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  coordinates?: string;
}

// -----------------------------------
// GIF DTO
// -----------------------------------
export class CreateGifDto {
  @ApiProperty({
    example: "https://example.com/gif.gif",
    description: "URL of the GIF",
    type: String,
  })
  @IsUrl()
  url: string;
}
