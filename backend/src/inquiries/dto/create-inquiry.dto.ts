import { Transform, Type } from "class-transformer";
import {
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { InquiryType } from "../../entities/investor-inquiry.entity";

export class CreateInquiryDto {
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: "Indiquez une adresse e-mail valide." })
  @MaxLength(254, { message: "L'adresse e-mail est trop longue." })
  email: string;

  @IsIn([InquiryType.PROPOSITION, InquiryType.QUESTION], {
    message: "Choisissez Proposition ou Question.",
  })
  type: InquiryType;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(5, {
    message: "Le message doit contenir au moins 5 caractères.",
  })
  @MaxLength(5000, {
    message: "Le message ne peut pas dépasser 5000 caractères.",
  })
  message: string;

  /** Honeypot. Humans never see this field. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  startedAt?: number;
}
