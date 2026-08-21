import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { InvestmentsService } from "./investments.service";
import { CreateInvestmentDto } from "./dto/create-investment.dto";
import { UpdateInvestmentStatusDto } from "./dto/update-investment-status.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { ApprovedInvestorGuard } from "../common/guards/approved.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { User, UserRole } from "../entities/user.entity";

@Controller("investments")
@UseGuards(JwtAuthGuard)
export class InvestmentsController {
  constructor(private investmentsService: InvestmentsService) {}

  @UseGuards(ApprovedInvestorGuard)
  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateInvestmentDto) {
    return this.investmentsService.create(user, dto);
  }

  @Get("me")
  mine(@CurrentUser() user: User) {
    return this.investmentsService.findMine(user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  all() {
    return this.investmentsService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(":id/status")
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateInvestmentStatusDto,
  ) {
    return this.investmentsService.updateStatus(id, dto.status);
  }
}
