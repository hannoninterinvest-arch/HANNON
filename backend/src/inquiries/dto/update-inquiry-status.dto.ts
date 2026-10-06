import { IsIn } from "class-validator";
import { InquiryStatus } from "../../entities/investor-inquiry.entity";

export class UpdateInquiryStatusDto {
  @IsIn([InquiryStatus.TRAITE], {
    message: "Le statut ne peut être marqué que comme traité.",
  })
  status: InquiryStatus.TRAITE;
}
