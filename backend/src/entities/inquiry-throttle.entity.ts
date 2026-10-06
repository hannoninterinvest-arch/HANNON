import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

/** Short-lived rows used to limit repeated public submissions across instances. */
@Entity("inquiry_throttles")
@Index(["ipHash", "createdAt"])
export class InquiryThrottle {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 64 })
  ipHash: string;

  @CreateDateColumn()
  createdAt: Date;
}
