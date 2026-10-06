import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { UserRole } from "../entities/user.entity";
import { CreatePlatformDto } from "./dto/create-platform.dto";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdatePlatformDto } from "./dto/update-platform.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { ServicesService } from "./services.service";

const imageUpload = FileInterceptor("file", {
  storage: memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

@Controller("services")
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Get()
  listPublished() {
    return this.servicesService.findPublished();
  }

  @Get("by-slug/:slug")
  bySlug(@Param("slug") slug: string) {
    return this.servicesService.findPublishedBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get("admin/all")
  listAll() {
    return this.servicesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get("admin/:id")
  findAdmin(@Param("id", ParseUUIDPipe) id: string) {
    return this.servicesService.findAdmin(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post("upload")
  @UseInterceptors(imageUpload)
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.servicesService.upload(file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.servicesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.servicesService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(":id/platforms")
  addPlatform(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreatePlatformDto,
  ) {
    return this.servicesService.addPlatform(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(":id/platforms/:platformId")
  updatePlatform(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("platformId", ParseUUIDPipe) platformId: string,
    @Body() dto: UpdatePlatformDto,
  ) {
    return this.servicesService.updatePlatform(id, platformId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(":id/platforms/:platformId")
  removePlatform(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("platformId", ParseUUIDPipe) platformId: string,
  ) {
    return this.servicesService.removePlatform(id, platformId);
  }
}
