import { createHash } from "crypto";
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, MoreThan, Repository } from "typeorm";
import { InquiryThrottle } from "../entities/inquiry-throttle.entity";
import {
  InquiryStatus,
  InquiryType,
  InvestorInquiry,
} from "../entities/investor-inquiry.entity";
import { CreateInquiryDto } from "./dto/create-inquiry.dto";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const IP_LIMIT_PER_HOUR = 8;
const EMAIL_LIMIT_PER_DAY = 5;
const MIN_GAP_MS = 20 * 1000;
const DEDUPE_MS = 2 * 60 * 1000;
const MIN_FILL_MS = 400;

@Injectable()
export class InquiriesService {
  constructor(
    @InjectRepository(InvestorInquiry)
    private inquiries: Repository<InvestorInquiry>,
    @InjectRepository(InquiryThrottle)
    private throttles: Repository<InquiryThrottle>,
  ) {}

  async create(dto: CreateInquiryDto, ipHash: string) {
    await this.throttle(ipHash);

    if (dto.website?.trim()) {
      return { ok: true as const };
    }

    if (typeof dto.startedAt === "number" && Number.isFinite(dto.startedAt)) {
      const elapsed = Date.now() - dto.startedAt;
      if (elapsed >= 0 && elapsed < MIN_FILL_MS) {
        throw new BadRequestException(
          "Veuillez patienter un instant avant d'envoyer le formulaire.",
        );
      }
    }

    const email = dto.email.trim().toLowerCase();
    const message = dto.message.trim();
    const sinceDedupe = new Date(Date.now() - DEDUPE_MS);
    const duplicate = await this.inquiries.findOne({
      where: {
        email,
        type: dto.type,
        message,
        receivedAt: MoreThan(sinceDedupe),
      },
    });
    if (duplicate) return { ok: true as const };

    const sinceGap = new Date(Date.now() - MIN_GAP_MS);
    const recentSameEmail = await this.inquiries.count({
      where: { email, receivedAt: MoreThan(sinceGap) },
    });
    if (recentSameEmail > 0) {
      throw new HttpException(
        "Un message vient d'être envoyé avec cette adresse. Patientez quelques secondes.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const sinceDay = new Date(Date.now() - DAY);
    const sentToday = await this.inquiries.count({
      where: { email, receivedAt: MoreThan(sinceDay) },
    });
    if (sentToday >= EMAIL_LIMIT_PER_DAY) {
      throw new HttpException(
        "Trop de messages ont été envoyés avec cette adresse. Réessayez plus tard.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.inquiries.save(
      this.inquiries.create({
        email,
        type: dto.type,
        message,
        status: InquiryStatus.NOUVEAU,
        ipHash,
      }),
    );
    return { ok: true as const };
  }

  async list(type?: string, status?: string) {
    if (type && !Object.values(InquiryType).includes(type as InquiryType)) {
      throw new BadRequestException("Type de filtre invalide.");
    }
    if (
      status &&
      !Object.values(InquiryStatus).includes(status as InquiryStatus)
    ) {
      throw new BadRequestException("Statut de filtre invalide.");
    }

    const qb = this.inquiries
      .createQueryBuilder("inquiry")
      .select([
        "inquiry.id",
        "inquiry.email",
        "inquiry.type",
        "inquiry.message",
        "inquiry.receivedAt",
        "inquiry.status",
      ])
      .orderBy("inquiry.receivedAt", "DESC");

    if (type) qb.andWhere("inquiry.type = :type", { type });
    if (status) qb.andWhere("inquiry.status = :status", { status });
    return qb.getMany();
  }

  async markHandled(id: string) {
    const inquiry = await this.inquiries.findOne({ where: { id } });
    if (!inquiry) throw new NotFoundException("Demande introuvable");
    await this.inquiries.update(id, { status: InquiryStatus.TRAITE });
    inquiry.status = InquiryStatus.TRAITE;
    return {
      id: inquiry.id,
      email: inquiry.email,
      type: inquiry.type,
      message: inquiry.message,
      receivedAt: inquiry.receivedAt,
      status: inquiry.status,
    };
  }

  async remove(id: string) {
    const inquiry = await this.inquiries.findOne({ where: { id } });
    if (!inquiry) throw new NotFoundException("Demande introuvable");
    await this.inquiries.delete(id);
    return { deleted: true };
  }

  hashIp(ip: string) {
    return createHash("sha256")
      .update(`${ip}|${process.env.JWT_SECRET || "hannon-inquiry"}`)
      .digest("hex");
  }

  private async throttle(ipHash: string) {
    const hourAgo = new Date(Date.now() - HOUR);
    const staleBefore = new Date(Date.now() - 2 * DAY);
    await this.throttles.delete({ createdAt: LessThan(staleBefore) });
    const recent = await this.throttles.count({
      where: { ipHash, createdAt: MoreThan(hourAgo) },
    });
    if (recent >= IP_LIMIT_PER_HOUR) {
      throw new HttpException(
        "Trop de messages ont été envoyés. Réessayez plus tard.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    await this.throttles.save(this.throttles.create({ ipHash }));
  }
}
