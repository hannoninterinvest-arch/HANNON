import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InquiryThrottle } from "../entities/inquiry-throttle.entity";
import { InvestorInquiry } from "../entities/investor-inquiry.entity";
import { InquiriesController } from "./inquiries.controller";
import { InquiriesService } from "./inquiries.service";

@Module({
  imports: [TypeOrmModule.forFeature([InvestorInquiry, InquiryThrottle])],
  controllers: [InquiriesController],
  providers: [InquiriesService],
})
export class InquiriesModule {}
