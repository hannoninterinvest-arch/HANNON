import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { ProjectStatus } from "../../entities/project.entity";

export class ProjectStatInputDto {
  @IsString()
  label: string;

  @Type(() => Number)
  @IsNumber()
  sortOrder: number;

  @Type(() => Number)
  @IsNumber()
  capitalRaised: number;

  @Type(() => Number)
  @IsNumber()
  investorsCount: number;

  @Type(() => Number)
  @IsNumber()
  projectedReturn: number;
}

export class CreateProjectDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsString()
  sector: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  cloudinaryPublicId?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  targetAmount: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  raisedAmount?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minInvestment: number;

  @Type(() => Number)
  @IsNumber()
  expectedReturn: number;

  @Type(() => Number)
  @IsNumber()
  durationMonths: number;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsBoolean()
  visible?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: string[];

  @IsOptional()
  @IsArray()
  stats?: ProjectStatInputDto[];
}
