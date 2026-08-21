import { IsEnum } from "class-validator";
import { InvestmentStatus } from "../../entities/investment-request.entity";

export class UpdateInvestmentStatusDto {
  @IsEnum(InvestmentStatus)
  status: InvestmentStatus;
}
