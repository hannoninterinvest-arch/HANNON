import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InvestmentRequest } from "../entities/investment-request.entity";
import { InvestmentsService } from "./investments.service";
import { InvestmentsController } from "./investments.controller";
import { ProjectsModule } from "../projects/projects.module";

@Module({
  imports: [TypeOrmModule.forFeature([InvestmentRequest]), ProjectsModule],
  providers: [InvestmentsService],
  controllers: [InvestmentsController],
})
export class InvestmentsModule {}
