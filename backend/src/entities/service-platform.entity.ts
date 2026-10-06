import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { PublishStatus } from "./publish-status.enum";
import { Service } from "./service.entity";

@Entity("service_platforms")
@Index(["sortOrder"])
export class ServicePlatform {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Service, (service) => service.platforms, {
    onDelete: "CASCADE",
  })
  service: Service;

  @Column({ type: "varchar", length: 180, default: "" })
  name: string;

  @Column({ type: "text", default: "" })
  description: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  link: string | null;

  @Column({ type: "text", nullable: true })
  imageUrl: string | null;

  @Column({ type: "varchar", length: 512, nullable: true })
  imagePublicId: string | null;

  @Column({ type: "text", nullable: true })
  secondImageUrl: string | null;

  @Column({ type: "varchar", length: 512, nullable: true })
  secondImagePublicId: string | null;

  @Column({ type: "int", default: 0 })
  sortOrder: number;

  @Column({
    type: "enum",
    enum: PublishStatus,
    enumName: "publish_status_enum",
    default: PublishStatus.DRAFT,
  })
  status: PublishStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
