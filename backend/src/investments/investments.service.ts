import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  InvestmentRequest,
  InvestmentStatus,
} from "../entities/investment-request.entity";
import { User } from "../entities/user.entity";
import { CreateInvestmentDto } from "./dto/create-investment.dto";
import { ProjectsService } from "../projects/projects.service";

@Injectable()
export class InvestmentsService {
  constructor(
    @InjectRepository(InvestmentRequest)
    private repo: Repository<InvestmentRequest>,
    private projectsService: ProjectsService,
  ) {}

  async create(investor: User, dto: CreateInvestmentDto) {
    const project = await this.projectsService.findOne(dto.projectId, true);
    const min = Number(project.minInvestment);
    if (dto.amount < min) {
      throw new BadRequestException(
        `Minimum investment for this project is ${min.toLocaleString()} USD`,
      );
    }
    const pending = await this.repo.findOne({
      where: {
        investor: { id: investor.id },
        project: { id: project.id },
        status: InvestmentStatus.PENDING,
      },
    });
    if (pending) {
      throw new BadRequestException(
        "You already have a pending request on this project",
      );
    }
    const request = this.repo.create({
      amount: String(dto.amount),
      message: dto.message ?? null,
      investor,
      project,
      status: InvestmentStatus.PENDING,
    });
    return this.strip(await this.repo.save(request));
  }

  async findMine(investorId: string) {
    const rows = await this.repo.find({
      where: { investor: { id: investorId } },
      relations: ["project"],
      order: { createdAt: "DESC" },
    });
    return rows.map((row) => this.strip(row));
  }

  async findAll() {
    const rows = await this.repo.find({
      relations: ["project", "investor"],
      order: { createdAt: "DESC" },
    });
    return rows.map((row) => this.strip(row));
  }

  async updateStatus(id: string, status: InvestmentStatus) {
    const request = await this.repo.findOne({
      where: { id },
      relations: ["project", "investor"],
    });
    if (!request) throw new NotFoundException("Investment request not found");
    if (request.status !== InvestmentStatus.PENDING) {
      throw new BadRequestException("This request has already been reviewed");
    }
    request.status = status;
    if (status === InvestmentStatus.ACCEPTED) {
      await this.projectsService.incrementRaised(
        request.project,
        Number(request.amount),
      );
    }
    return this.strip(await this.repo.save(request));
  }

  private strip(request: InvestmentRequest) {
    if (!request.investor) return request;
    const { password: _password, ...investor } = request.investor;
    return { ...request, investor };
  }
}
