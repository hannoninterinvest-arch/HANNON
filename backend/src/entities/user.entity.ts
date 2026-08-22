import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { InvestmentRequest } from "./investment-request.entity";

export enum UserRole {
  ADMIN = "admin",
  INVESTOR = "investor",
}

export enum UserStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255 })
  password: string;

  @Column({ type: "varchar", length: 120 })
  firstName: string;

  @Column({ type: "varchar", length: 120 })
  lastName: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  company: string | null;

  @Column({ type: "varchar", length: 64, nullable: true })
  phone: string | null;

  @Column({ type: "enum", enum: UserRole, default: UserRole.INVESTOR })
  role: UserRole;

  @Column({ type: "enum", enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @OneToMany(() => InvestmentRequest, (req) => req.investor)
  investments: InvestmentRequest[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
