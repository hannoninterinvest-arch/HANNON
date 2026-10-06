import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { PublishStatus } from "./publish-status.enum";
import { ServicePlatform } from "./service-platform.entity";

@Entity("services")
@Index(["status", "sortOrder"])
export class Service {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 180 })
  name: string;

  @Column({ type: "varchar", length: 200, unique: true })
  slug: string;

  @Column({ type: "text", default: "" })
  description: string;

  @Column({ type: "text", nullable: true })
  imageUrl: string | null;

  @Column({ type: "varchar", length: 512, nullable: true })
  cloudinaryPublicId: string | null;

  @Column({ type: "int", default: 0 })
  sortOrder: number;

  @Column({
    type: "enum",
    enum: PublishStatus,
    enumName: "publish_status_enum",
    default: PublishStatus.DRAFT,
  })
  status: PublishStatus;

  /** Prevents the seed from recreating HANNON Finance placeholders after an admin deletes them. */
  @Column({ type: "boolean", default: false })
  placeholdersPrepared: boolean;

  @OneToMany(() => ServicePlatform, (platform) => platform.service, {
    cascade: true,
  })
  platforms: ServicePlatform[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
