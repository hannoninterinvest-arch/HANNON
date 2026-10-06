import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { PublishStatus } from "../../entities/publish-status.enum";

export class CreatePlatformDto {
  @IsOptional()
  @IsString()
  @MaxLength(180)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  link?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  imageUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  imagePublicId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  secondImageUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  secondImagePublicId?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10000)
  sortOrder?: number;

  @IsOptional()
  @IsEnum(PublishStatus)
  status?: PublishStatus;
}
