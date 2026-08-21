import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Project } from "./project.entity";

@Entity("project_stats")
export class ProjectStat {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  label: string;

  @Column({ type: "int", default: 0 })
  sortOrder: number;

  @Column({ type: "decimal", precision: 14, scale: 2, default: 0 })
  capitalRaised: string;

  @Column({ type: "int", default: 0 })
  investorsCount: number;

  @Column({ type: "decimal", precision: 6, scale: 2, default: 0 })
  projectedReturn: string;

  @ManyToOne(() => Project, (project) => project.stats, { onDelete: "CASCADE" })
  project: Project;
}
