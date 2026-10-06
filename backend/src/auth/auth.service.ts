import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { User, UserRole } from "../entities/user.entity";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(_dto: RegisterDto) {
    throw new ForbiddenException(
      "La création de comptes investisseurs est désactivée. Envoyez votre proposition ou votre question via le formulaire de contact.",
    );
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException("Invalid credentials");
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException("Invalid credentials");
    if (user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException(
        "La connexion réservée aux investisseurs n'est plus disponible. Envoyez votre proposition ou votre question via le formulaire de contact.",
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
