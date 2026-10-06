import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { slugify } from "../common/slug";
import { PublishStatus } from "../entities/publish-status.enum";
import { Service } from "../entities/service.entity";
import { ServicePlatform } from "../entities/service-platform.entity";
import { CreatePlatformDto } from "./dto/create-platform.dto";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdatePlatformDto } from "./dto/update-platform.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";

const IMAGE_FOLDER = "hannon/services";

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private services: Repository<Service>,
    @InjectRepository(ServicePlatform)
    private platforms: Repository<ServicePlatform>,
    private cloudinary: CloudinaryService,
  ) {}

  async findPublished() {
    const services = await this.services.find({
      where: { status: PublishStatus.PUBLISHED },
      order: { sortOrder: "ASC", name: "ASC" },
    });
    return services.map((service) => ({
      id: service.id,
      name: service.name,
      slug: service.slug,
      description: service.description,
      imageUrl: service.imageUrl,
      sortOrder: service.sortOrder,
    }));
  }

  async findPublishedBySlug(slug: string) {
    const service = await this.services.findOne({
      where: { slug, status: PublishStatus.PUBLISHED },
      relations: ["platforms"],
    });
    if (!service) throw new NotFoundException("Service introuvable");
    return this.toPublic(service);
  }

  findAll() {
    return this.services.find({
      relations: ["platforms"],
      order: {
        sortOrder: "ASC",
        name: "ASC",
        platforms: { sortOrder: "ASC" },
      },
    });
  }

  async findAdmin(id: string) {
    const service = await this.services.findOne({
      where: { id },
      relations: ["platforms"],
      order: { platforms: { sortOrder: "ASC" } },
    });
    if (!service) throw new NotFoundException("Service introuvable");
    return service;
  }

  async create(dto: CreateServiceDto) {
    const name = dto.name.trim();
    const status = dto.status ?? PublishStatus.DRAFT;
    this.assertPublishable(status, name);
    const sortOrder = dto.sortOrder ?? (await this.nextSortOrder());
    const service = this.services.create({
      name,
      slug: await this.uniqueSlug(slugify(name)),
      description: dto.description?.trim() ?? "",
      imageUrl: this.normalizeImageUrl(dto.imageUrl),
      cloudinaryPublicId: this.normalizePublicId(dto.cloudinaryPublicId),
      sortOrder,
      status,
      placeholdersPrepared: false,
    });
    return this.services.save(service);
  }

  async update(id: string, dto: UpdateServiceDto) {
    const service = await this.findAdmin(id);
    if (dto.name !== undefined) service.name = dto.name.trim();
    if (dto.description !== undefined) service.description = dto.description.trim();
    if (dto.sortOrder !== undefined) service.sortOrder = dto.sortOrder;
    if (dto.status !== undefined) service.status = dto.status;
    this.assertPublishable(service.status, service.name);

    if (dto.imageUrl !== undefined || dto.cloudinaryPublicId !== undefined) {
      const nextUrl =
        dto.imageUrl !== undefined
          ? this.normalizeImageUrl(dto.imageUrl)
          : service.imageUrl;
      const nextId =
        dto.cloudinaryPublicId !== undefined
          ? this.normalizePublicId(dto.cloudinaryPublicId)
          : service.cloudinaryPublicId;
      if (service.cloudinaryPublicId && service.cloudinaryPublicId !== nextId) {
        await this.safeDestroy(service.cloudinaryPublicId);
      }
      service.imageUrl = nextUrl;
      service.cloudinaryPublicId = nextId;
    }

    return this.services.save(service);
  }

  async remove(id: string) {
    const service = await this.findAdmin(id);
    await this.safeDestroy(service.cloudinaryPublicId);
    for (const platform of service.platforms || []) {
      await this.safeDestroy(platform.imagePublicId);
      await this.safeDestroy(platform.secondImagePublicId);
    }
    await this.services.delete(id);
    return { deleted: true };
  }

  async upload(file: Express.Multer.File) {
    if (!file) throw new BadRequestException("Le fichier image est obligatoire.");
    if (!file.mimetype?.startsWith("image/")) {
      throw new BadRequestException("Seules les images sont acceptées.");
    }
    const uploaded = await this.cloudinary.uploadBuffer(file.buffer, IMAGE_FOLDER);
    return {
      imageUrl: uploaded.secure_url,
      cloudinaryPublicId: uploaded.public_id,
    };
  }

  async addPlatform(serviceId: string, dto: CreatePlatformDto) {
    const service = await this.findAdmin(serviceId);
    const status = dto.status ?? PublishStatus.DRAFT;
    const name = dto.name?.trim() ?? "";
    this.assertPublishable(status, name, "cette plateforme");
    const sortOrder =
      dto.sortOrder ??
      (service.platforms?.reduce((max, item) => Math.max(max, item.sortOrder), -1) ??
        -1) +
        1;
    const platform = this.platforms.create({
      service,
      name,
      description: dto.description?.trim() ?? "",
      link: this.normalizeLink(dto.link),
      imageUrl: this.normalizeImageUrl(dto.imageUrl),
      imagePublicId: this.normalizePublicId(dto.imagePublicId),
      secondImageUrl: this.normalizeImageUrl(dto.secondImageUrl),
      secondImagePublicId: this.normalizePublicId(dto.secondImagePublicId),
      sortOrder,
      status,
    });
    return this.platforms.save(platform);
  }

  async updatePlatform(
    serviceId: string,
    platformId: string,
    dto: UpdatePlatformDto,
  ) {
    const platform = await this.findPlatform(serviceId, platformId);
    if (dto.name !== undefined) platform.name = dto.name.trim();
    if (dto.description !== undefined) platform.description = dto.description.trim();
    if (dto.link !== undefined) platform.link = this.normalizeLink(dto.link);
    if (dto.sortOrder !== undefined) platform.sortOrder = dto.sortOrder;
    if (dto.status !== undefined) platform.status = dto.status;
    this.assertPublishable(platform.status, platform.name, "cette plateforme");
    await this.assignImage(platform, "imageUrl", "imagePublicId", dto.imageUrl, dto.imagePublicId);
    await this.assignImage(
      platform,
      "secondImageUrl",
      "secondImagePublicId",
      dto.secondImageUrl,
      dto.secondImagePublicId,
    );
    return this.platforms.save(platform);
  }

  async removePlatform(serviceId: string, platformId: string) {
    const platform = await this.findPlatform(serviceId, platformId);
    await this.safeDestroy(platform.imagePublicId);
    await this.safeDestroy(platform.secondImagePublicId);
    await this.platforms.delete(platform.id);
    return { deleted: true };
  }

  private async findPlatform(serviceId: string, platformId: string) {
    const platform = await this.platforms.findOne({
      where: { id: platformId, service: { id: serviceId } },
    });
    if (!platform) throw new NotFoundException("Plateforme introuvable");
    return platform;
  }

  private toPublic(service: Service) {
    const platforms = (service.platforms || [])
      .filter((platform) => platform.status === PublishStatus.PUBLISHED)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
      .map((platform) => ({
        id: platform.id,
        name: platform.name,
        description: platform.description,
        link: platform.link,
        imageUrl: platform.imageUrl,
        secondImageUrl: platform.secondImageUrl,
        sortOrder: platform.sortOrder,
      }));
    return {
      id: service.id,
      name: service.name,
      slug: service.slug,
      description: service.description,
      imageUrl: service.imageUrl,
      sortOrder: service.sortOrder,
      platforms,
    };
  }

  private assertPublishable(
    status: PublishStatus,
    name: string,
    subject = "ce service",
  ) {
    if (status === PublishStatus.PUBLISHED && !name.trim()) {
      throw new BadRequestException(
        `Indiquez un nom avant de publier ${subject}.`,
      );
    }
  }

  private async nextSortOrder() {
    const raw = await this.services.maximum("sortOrder");
    const current = raw == null ? -1 : Number(raw);
    return (Number.isFinite(current) ? current : -1) + 1;
  }

  private async uniqueSlug(base: string) {
    let slug = base;
    let i = 2;
    while (await this.services.findOne({ where: { slug } })) {
      slug = `${base}-${i++}`;
    }
    return slug;
  }

  private normalizeLink(link?: string | null) {
    if (link == null) return null;
    const value = link.trim();
    if (!value) return null;
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new BadRequestException(
        "Le lien doit être une URL http ou https valide.",
      );
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new BadRequestException(
        "Le lien doit commencer par http:// ou https://.",
      );
    }
    return value;
  }

  private normalizeImageUrl(url?: string | null) {
    if (url == null) return null;
    const value = url.trim();
    if (!value) return null;
    let parsed: URL;
    try {
      parsed = new URL(value);
    } catch {
      throw new BadRequestException("L'adresse de l'image est invalide.");
    }
    if (parsed.protocol !== "https:") {
      throw new BadRequestException("L'image doit être servie en HTTPS.");
    }
    return value;
  }

  private normalizePublicId(value?: string | null) {
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed || null;
  }

  private async assignImage(
    platform: ServicePlatform,
    urlKey: "imageUrl" | "secondImageUrl",
    idKey: "imagePublicId" | "secondImagePublicId",
    nextUrl: string | null | undefined,
    nextId: string | null | undefined,
  ) {
    if (nextUrl === undefined && nextId === undefined) return;
    const url = nextUrl !== undefined ? this.normalizeImageUrl(nextUrl) : platform[urlKey];
    const publicId =
      nextId !== undefined ? this.normalizePublicId(nextId) : platform[idKey];
    if (platform[idKey] && platform[idKey] !== publicId) {
      await this.safeDestroy(platform[idKey]);
    }
    platform[urlKey] = url;
    platform[idKey] = publicId;
  }

  private async safeDestroy(publicId: string | null | undefined) {
    if (!publicId) return;
    try {
      await this.cloudinary.destroy(publicId);
    } catch {
      // Image cleanup is best-effort and must not block the record change.
    }
  }
}
