import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ProjectStat } from "./project-stat.entity";
import { InvestmentRequest } from "./investment-request.entity";

export enum ProjectStatus {
  OPEN = "open",
  FUNDED = "funded",
  CLOSED = "closed",
}

@Entity("projects")
export class Project {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "text", nullable: true })
  summary: string | null;

  @Column()
  sector: string;

  @Column()
  location: string;

  @Column({ nullable: true })
  imageUrl: string | null;

  @Column({ nullable: true })
  cloudinaryPublicId: string | null;

  @Column({ type: "decimal", precision: 14, scale: 2, default: 0 })
  targetAmount: string;

  @Column({ type: "decimal", precision: 14, scale: 2, default: 0 })
  raisedAmount: string;

  @Column({ type: "decimal", precision: 14, scale: 2, default: 0 })
  minInvestment: string;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  expectedReturn: string;

  @Column({ type: "int", default: 12 })
  durationMonths: number;

  @Column({ type: "enum", enum: ProjectStatus, default: ProjectStatus.OPEN })
  status: ProjectStatus;

  @Column({ default: true })
  visible: boolean;

  @Column({ type: "simple-array", nullable: true })
  highlights: string[] | null;

  @OneToMany(() => ProjectStat, (stat) => stat.project, { cascade: true })
  stats: ProjectStat[];

  @OneToMany(() => InvestmentRequest, (req) => req.project)
  investments: InvestmentRequest[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
