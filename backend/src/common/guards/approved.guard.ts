import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { UserRole, UserStatus } from "../../entities/user.entity";

@Injectable()
export class ApprovedInvestorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException("Authentication required");
    if (user.role === UserRole.ADMIN) return true;
    if (user.status !== UserStatus.APPROVED) {
      throw new ForbiddenException(
        "Your investor account is pending administrator approval",
      );
    }
    return true;
  }
}
