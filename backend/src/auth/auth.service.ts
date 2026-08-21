import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { User, UserRole, UserStatus } from "../entities/user.entity";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException("An account with this email already exists");
    }
    const password = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      email: dto.email.toLowerCase(),
      password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      company: dto.company ?? null,
      phone: dto.phone ?? null,
      role: UserRole.INVESTOR,
      status: UserStatus.PENDING,
    });
    return {
      user: this.sanitize(user),
      message:
        "Account created. An administrator will review your profile before you can invest.",
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException("Invalid credentials");
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException("Invalid credentials");
    if (user.role === UserRole.INVESTOR && user.status === UserStatus.REJECTED) {
      throw new UnauthorizedException(
        "Your investor account has been declined. Please contact HANNON.",
      );
    }
    return {
      token: this.sign(user),
      user: this.sanitize(user),
    };
  }

  sanitize(user: User) {
    const { password: _password, ...safe } = user;
    return safe;
  }

  private sign(user: User) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
