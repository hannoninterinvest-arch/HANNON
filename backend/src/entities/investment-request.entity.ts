import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Project } from "./project.entity";

export enum InvestmentStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

@Entity("investment_requests")
export class InvestmentRequest {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "decimal", precision: 14, scale: 2 })
  amount: string;

  @Column({ type: "text", nullable: true })
  message: string | null;

  @Column({
    type: "enum",
    enum: InvestmentStatus,
    default: InvestmentStatus.PENDING,
  })
  status: InvestmentStatus;

  @ManyToOne(() => User, (user) => user.investments, { onDelete: "CASCADE" })
  investor: User;

  @ManyToOne(() => Project, (project) => project.investments, {
    onDelete: "CASCADE",
  })
  project: Project;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
