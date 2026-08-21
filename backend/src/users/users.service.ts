import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserRole, UserStatus } from "../entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  create(data: Partial<User>) {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email: email.toLowerCase() } });
  }

  async findById(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  findInvestors() {
    return this.repo.find({
      where: { role: UserRole.INVESTOR },
      order: { createdAt: "DESC" },
      select: [
        "id",
        "email",
        "firstName",
        "lastName",
        "company",
        "phone",
        "role",
        "status",
        "createdAt",
      ],
    });
  }

  async updateStatus(id: string, status: UserStatus) {
    const user = await this.findById(id);
    user.status = status;
    const saved = await this.repo.save(user);
    const { password: _p, ...safe } = saved;
    return safe;
  }

  countAdmins() {
    return this.repo.count({ where: { role: UserRole.ADMIN } });
  }
}
