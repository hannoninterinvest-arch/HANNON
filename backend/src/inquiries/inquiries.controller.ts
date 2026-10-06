import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { UserRole } from "../entities/user.entity";
import { CreateInquiryDto } from "./dto/create-inquiry.dto";
import { UpdateInquiryStatusDto } from "./dto/update-inquiry-status.dto";
import { InquiriesService } from "./inquiries.service";

@Controller("inquiries")
export class InquiriesController {
  constructor(private inquiriesService: InquiriesService) {}

  @Post()
  create(@Body() dto: CreateInquiryDto, @Req() req: Request) {
    return this.inquiriesService.create(dto, this.inquiriesService.hashIp(this.clientIp(req)));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  list(@Query("type") type?: string, @Query("status") status?: string) {
    return this.inquiriesService.list(type, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(":id/status")
  markHandled(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() _dto: UpdateInquiryStatusDto,
  ) {
    return this.inquiriesService.markHandled(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.inquiriesService.remove(id);
  }

  private clientIp(req: Request) {
    const forwarded = req.headers["x-forwarded-for"];
    const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const first = raw?.split(",")[0]?.trim();
    return first || req.ip || req.socket?.remoteAddress || "unknown";
  }
}
