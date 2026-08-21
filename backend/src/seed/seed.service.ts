import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { User, UserRole, UserStatus } from "../entities/user.entity";
import { Project, ProjectStatus } from "../entities/project.entity";
import { ProjectStat } from "../entities/project-stat.entity";

const CLOUD = "https://res.cloudinary.com/dbzweuzla/image/upload";

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly log = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Project) private projects: Repository<Project>,
    @InjectRepository(ProjectStat) private stats: Repository<ProjectStat>,
  ) {}

  async onModuleInit() {
    await this.ensureAdmin();
    await this.ensureDemoInvestor();
    await this.ensureProjects();
  }

  private async ensureAdmin() {
    const email = (process.env.ADMIN_EMAIL || "admin@hannoninterinvest.com").toLowerCase();
    const existing = await this.users.findOne({ where: { email } });
    if (existing) return;
    const password = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || "HannonAdmin2026!",
      12,
    );
    await this.users.save(
      this.users.create({
        email,
        password,
        firstName: "HANNON",
        lastName: "Administrator",
        company: "HANNON International Investments Ltd",
        role: UserRole.ADMIN,
        status: UserStatus.APPROVED,
      }),
    );
    this.log.log(`Seeded admin account: ${email}`);
  }

  private async ensureDemoInvestor() {
    const email = "investor@hannoninterinvest.com";
    const existing = await this.users.findOne({ where: { email } });
    if (existing) return;
    const password = await bcrypt.hash("Investor2026!", 12);
    await this.users.save(
      this.users.create({
        email,
        password,
        firstName: "Amine",
        lastName: "Ben Salah",
        company: "Atlas Capital Partners",
        phone: "+216 20 000 000",
        role: UserRole.INVESTOR,
        status: UserStatus.APPROVED,
      }),
    );
    await this.users.save(
      this.users.create({
        email: "pending@hannoninterinvest.com",
        password,
        firstName: "Leila",
        lastName: "Mansour",
        company: "Medina Family Office",
        role: UserRole.INVESTOR,
        status: UserStatus.PENDING,
      }),
    );
    this.log.log("Seeded demo investor accounts");
  }

  private async ensureProjects() {
    const count = await this.projects.count();
    if (count > 0) return;

    const samples = [
      {
        title: "West Africa Solar Corridor",
        slug: "west-africa-solar-corridor",
        sector: "Energy",
        location: "Ghana · Côte d'Ivoire",
        summary:
          "Utility-scale solar generation and grid interconnection serving industrial corridors.",
        description:
          "A 420 MW solar corridor with storage support, structured as a blended-finance vehicle for institutional and family-office capital. The platform combines sovereign offtake, DFI guarantees, and senior project debt to deliver contracted cash flows with a target net IRR of 11.5%.",
        imageUrl: `${CLOUD}/v1786386096/630292ea-2558-499a-b414-3180fabd058b.jfif_2K_202608101920_asse86.jpg`,
        targetAmount: 85000000,
        raisedAmount: 41200000,
        minInvestment: 250000,
        expectedReturn: 11.5,
        durationMonths: 84,
        highlights: [
          "Sovereign offtake agreements",
          "DFI first-loss tranche",
          "Grid interconnection secured",
        ],
      },
      {
        title: "Tunis Logistics Gateway",
        slug: "tunis-logistics-gateway",
        sector: "Infrastructure",
        location: "Tunis, Tunisia",
        summary:
          "Modern logistics and cold-chain platform serving North African trade routes.",
        description:
          "Development of a bonded logistics park with cold storage, last-mile distribution, and customs-integrated warehousing. Capital is deployed into income-producing assets with contracted occupancy from regional distributors and agri-exporters.",
        imageUrl: `${CLOUD}/v1786403692/footer_dyjgmz.webp`,
        targetAmount: 42000000,
        raisedAmount: 18600000,
        minInvestment: 100000,
        expectedReturn: 9.8,
        durationMonths: 60,
        highlights: [
          "Pre-leased occupancy 62%",
          "Free-zone tax framework",
          "Export corridor access",
        ],
      },
      {
        title: "Maghreb Green Hydrogen Hub",
        slug: "maghreb-green-hydrogen-hub",
        sector: "Energy Transition",
        location: "Morocco · Mauritania",
        summary:
          "Early-stage hydrogen and derivative fuels platform for European offtake.",
        description:
          "A phased green hydrogen development anchored by renewable generation, desalination, and ammonia conversion. The investment thesis is built on European import demand, concessional climate finance, and long-dated offtake discussions with industrial buyers.",
        imageUrl: `${CLOUD}/v1786386096/630292ea-2558-499a-b414-3180fabd058b.jfif_2K_202608101920_asse86.jpg`,
        targetAmount: 120000000,
        raisedAmount: 27500000,
        minInvestment: 500000,
        expectedReturn: 13.2,
        durationMonths: 96,
        status: ProjectStatus.OPEN,
        highlights: [
          "Climate-aligned capital stack",
          "Phased construction risk",
          "EU industrial offtake path",
        ],
      },
      {
        title: "Affordable Housing Tunisia",
        slug: "affordable-housing-tunisia",
        sector: "Real Estate",
        location: "Grand Tunis",
        summary:
          "Mid-market residential programme with institutional co-investment.",
        description:
          "A multi-phase residential programme delivering 1,200 units with a mix of home-ownership and yield-bearing rental stock. Structuring includes local bank financing, a mezzanine sleeve, and an equity vehicle for qualified investors.",
        imageUrl: `${CLOUD}/v1786403136/WhatsApp_Image_2026-08-07_at_10.32.35_kzawur.jpg`,
        targetAmount: 28000000,
        raisedAmount: 15400000,
        minInvestment: 75000,
        expectedReturn: 8.4,
        durationMonths: 48,
        highlights: [
          "Bankable local demand",
          "Staged land release",
          "Rental yield overlay",
        ],
      },
    ];

    for (const sample of samples) {
      const project = this.projects.create({
        title: sample.title,
        slug: sample.slug,
        description: sample.description,
        summary: sample.summary,
        sector: sample.sector,
        location: sample.location,
        imageUrl: sample.imageUrl,
        targetAmount: String(sample.targetAmount),
        raisedAmount: String(sample.raisedAmount),
        minInvestment: String(sample.minInvestment),
        expectedReturn: String(sample.expectedReturn),
        durationMonths: sample.durationMonths,
        status: ProjectStatus.OPEN,
        visible: true,
        highlights: sample.highlights,
      });
      project.stats = this.buildStats(
        sample.raisedAmount,
        sample.expectedReturn,
      );
      await this.projects.save(project);
    }
    this.log.log("Seeded investment projects");
  }

  private buildStats(raised: number, expectedReturn: number) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
    return months.map((label, i) => {
      const progress = (i + 1) / months.length;
      return this.stats.create({
        label: `${label} 2026`,
        sortOrder: i,
        capitalRaised: String(Math.round(raised * (0.35 + progress * 0.65))),
        investorsCount: Math.max(2, Math.round(progress * 22)),
        projectedReturn: String(
          Number((expectedReturn * (0.4 + progress * 0.6)).toFixed(2)),
        ),
      });
    });
  }
}
