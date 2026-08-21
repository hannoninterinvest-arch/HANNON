import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Project } from "../entities/project.entity";
import { ProjectStat } from "../entities/project-stat.entity";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { CloudinaryService } from "../cloudinary/cloudinary.service";

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projects: Repository<Project>,
    @InjectRepository(ProjectStat)
    private stats: Repository<ProjectStat>,
    private cloudinary: CloudinaryService,
  ) {}

  findVisible() {
    return this.projects.find({
      where: { visible: true },
      relations: ["stats"],
      order: { createdAt: "DESC", stats: { sortOrder: "ASC" } },
    });
  }

  findAll() {
    return this.projects.find({
      relations: ["stats"],
      order: { createdAt: "DESC", stats: { sortOrder: "ASC" } },
    });
  }

  async findOne(id: string, visibleOnly = false) {
    const project = await this.projects.findOne({
      where: visibleOnly ? { id, visible: true } : { id },
      relations: ["stats"],
      order: { stats: { sortOrder: "ASC" } },
    });
    if (!project) throw new NotFoundException("Project not found");
    return project;
  }

  async create(dto: CreateProjectDto) {
    const slug = dto.slug?.trim() || this.slugify(dto.title);
    const existing = await this.projects.findOne({ where: { slug } });
    if (existing) throw new BadRequestException("A project with this slug already exists");

    const project = this.projects.create({
      title: dto.title,
      slug,
      description: dto.description,
      summary: dto.summary ?? null,
      sector: dto.sector,
      location: dto.location,
      imageUrl: dto.imageUrl ?? null,
      cloudinaryPublicId: dto.cloudinaryPublicId ?? null,
      targetAmount: String(dto.targetAmount),
      raisedAmount: String(dto.raisedAmount ?? 0),
      minInvestment: String(dto.minInvestment),
      expectedReturn: String(dto.expectedReturn),
      durationMonths: dto.durationMonths,
      status: dto.status,
      visible: dto.visible ?? true,
      highlights: dto.highlights ?? null,
    });

    const stats = (dto.stats?.length
      ? dto.stats
      : this.generateStats(dto.raisedAmount ?? 0, dto.expectedReturn)
    ).map((s) =>
      this.stats.create({
        label: s.label,
        sortOrder: s.sortOrder,
        capitalRaised: String(s.capitalRaised),
        investorsCount: s.investorsCount,
        projectedReturn: String(s.projectedReturn),
      }),
    );
    project.stats = stats;
    return this.projects.save(project);
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.findOne(id);
    if (dto.title) project.title = dto.title;
    if (dto.slug) project.slug = dto.slug;
    if (dto.description) project.description = dto.description;
    if (dto.summary !== undefined) project.summary = dto.summary ?? null;
    if (dto.sector) project.sector = dto.sector;
    if (dto.location) project.location = dto.location;
    if (dto.imageUrl !== undefined) project.imageUrl = dto.imageUrl ?? null;
    if (dto.cloudinaryPublicId !== undefined) {
      project.cloudinaryPublicId = dto.cloudinaryPublicId ?? null;
    }
    if (dto.targetAmount !== undefined) project.targetAmount = String(dto.targetAmount);
    if (dto.raisedAmount !== undefined) project.raisedAmount = String(dto.raisedAmount);
    if (dto.minInvestment !== undefined) project.minInvestment = String(dto.minInvestment);
    if (dto.expectedReturn !== undefined) {
      project.expectedReturn = String(dto.expectedReturn);
    }
    if (dto.durationMonths !== undefined) project.durationMonths = dto.durationMonths;
    if (dto.status) project.status = dto.status;
    if (dto.visible !== undefined) project.visible = dto.visible;
    if (dto.highlights !== undefined) project.highlights = dto.highlights ?? null;

    if (dto.stats) {
      await this.stats.delete({ project: { id: project.id } });
      project.stats = dto.stats.map((s) =>
        this.stats.create({
          label: s.label,
          sortOrder: s.sortOrder,
          capitalRaised: String(s.capitalRaised),
          investorsCount: s.investorsCount,
          projectedReturn: String(s.projectedReturn),
        }),
      );
    }

    return this.projects.save(project);
  }

  async remove(id: string) {
    const project = await this.findOne(id);
    if (project.cloudinaryPublicId) {
      try {
        await this.cloudinary.destroy(project.cloudinaryPublicId);
      } catch {
        // Image cleanup is best-effort
      }
    }
    await this.projects.remove(project);
    return { deleted: true };
  }

  async attachImage(id: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException("Image file is required");
    const project = await this.findOne(id);
    if (project.cloudinaryPublicId) {
      try {
        await this.cloudinary.destroy(project.cloudinaryPublicId);
      } catch {
        // ignore
      }
    }
    const uploaded = await this.cloudinary.uploadBuffer(file.buffer);
    project.imageUrl = uploaded.secure_url;
    project.cloudinaryPublicId = uploaded.public_id;
    return this.projects.save(project);
  }

  async uploadStandalone(file: Express.Multer.File) {
    if (!file) throw new BadRequestException("Image file is required");
    const uploaded = await this.cloudinary.uploadBuffer(file.buffer);
    return {
      imageUrl: uploaded.secure_url,
      cloudinaryPublicId: uploaded.public_id,
    };
  }

  incrementRaised(project: Project, amount: number) {
    const next = Number(project.raisedAmount) + amount;
    project.raisedAmount = String(next);
    return this.projects.save(project);
  }

  private slugify(title: string) {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  private generateStats(raised: number, expectedReturn: number) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
    return months.map((label, i) => {
      const progress = (i + 1) / months.length;
      return {
        label: `${label} 2026`,
        sortOrder: i,
        capitalRaised: Math.round(raised * progress),
        investorsCount: Math.max(1, Math.round(progress * 18)),
        projectedReturn: Number((expectedReturn * progress).toFixed(2)),
      };
    });
  }
}
