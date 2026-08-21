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

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  company: string | null;

  @Column({ nullable: true })
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
