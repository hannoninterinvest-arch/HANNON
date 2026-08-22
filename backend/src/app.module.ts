import "./env";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Project } from "./entities/project.entity";
import { ProjectStat } from "./entities/project-stat.entity";
import { InvestmentRequest } from "./entities/investment-request.entity";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ProjectsModule } from "./projects/projects.module";
import { InvestmentsModule } from "./investments/investments.module";
import { CloudinaryModule } from "./cloudinary/cloudinary.module";
import { SeedService } from "./seed/seed.service";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env", "../.env"] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const rawUrl = config.get<string>("DATABASE_URL");
        if (!rawUrl) {
          throw new Error("DATABASE_URL is required (Neon Postgres connection string)");
        }
        const local = /localhost|127\.0\.0\.1/.test(rawUrl);
        let url = rawUrl;
        if (
          !local &&
          url.includes("sslmode=require") &&
          !url.includes("uselibpqcompat=")
        ) {
          url += url.includes("?") ? "&uselibpqcompat=true" : "?uselibpqcompat=true";
        }
        return {
          type: "postgres" as const,
          url,
          ssl: local ? false : { rejectUnauthorized: false },
          uuidExtension: "pgcrypto",
          entities: [User, Project, ProjectStat, InvestmentRequest],
          synchronize: true,
          logging: false,
        };
      },
    }),
    TypeOrmModule.forFeature([User, Project, ProjectStat]),
    AuthModule,
    UsersModule,
    ProjectsModule,
    InvestmentsModule,
    CloudinaryModule,
  ],
  controllers: [HealthController],
  providers: [SeedService],
})
export class AppModule {}
