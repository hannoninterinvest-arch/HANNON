import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

export enum InquiryType {
  PROPOSITION = "proposition",
  QUESTION = "question",
}

export enum InquiryStatus {
  NOUVEAU = "nouveau",
  TRAITE = "traité",
}

@Entity("investor_inquiries")
@Index(["type", "status"])
@Index(["email", "receivedAt"])
export class InvestorInquiry {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 254 })
  email: string;

  @Column({
    type: "enum",
    enum: InquiryType,
    enumName: "inquiry_type_enum",
  })
  type: InquiryType;

  @Column({ type: "text" })
  message: string;

  @CreateDateColumn()
  receivedAt: Date;

  @Column({
    type: "enum",
    enum: InquiryStatus,
    enumName: "inquiry_status_enum",
    default: InquiryStatus.NOUVEAU,
  })
  status: InquiryStatus;

  /** Hashed client address used only for rate limiting. Never returned by the API. */
  @Column({ type: "varchar", length: 64, nullable: true, select: false })
  ipHash: string | null;
}
