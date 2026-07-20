import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';

import { User, UserStatus } from '../users/entities/user.entity';
import { RoleName } from '../users/entities/role.entity';
import { UsersService } from '../users/users.service';
import { RolesService } from '../users/roles.service';
import { StudentsService } from '../students/students.service';
import { RefreshToken } from './entities/refresh-token.entity';
import {
  EmailVerificationToken,
  PasswordResetToken,
} from './entities/tokens.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/auth.dto';
import { JwtPayload } from './jwt-payload.interface';
import { generateSecureToken, hashToken } from '../../utils/token.util';
import { QueueService } from '../queues/queue.service';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface RequestContext {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly studentsService: StudentsService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly queueService: QueueService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(EmailVerificationToken)
    private readonly emailTokenRepo: Repository<EmailVerificationToken>,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokenRepo: Repository<PasswordResetToken>,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const studentRole = await this.rolesService.findByName(RoleName.STUDENT);
    if (!studentRole) {
      throw new BadRequestException('Student role is not provisioned yet');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.usersService.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      passwordHash,
      roleId: studentRole.id,
      status: UserStatus.PENDING,
      emailVerified: false,
    });

    await this.studentsService.createProfile(user.id);

    const { token } = await this.issueEmailVerificationToken(user.id);
    await this.queueService.enqueueEmail({
      to: user.email,
      subject: 'Verify your Bandwise account',
      text: `Welcome to Bandwise! Verify your email using this token: ${token}\n\nThis link expires in 24 hours.`,
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  async login(dto: LoginDto, ctx: RequestContext = {}) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('This account has been suspended');
    }

    user.lastLogin = new Date();
    await this.usersService.save(user);

    const tokens = await this.issueTokenPair(user, ctx);
    return {
      user: this.toPublicUser(user),
      ...tokens,
    };
  }

  async refresh(rawRefreshToken: string, ctx: RequestContext = {}) {
    const tokenHash = hashToken(rawRefreshToken);
    const stored = await this.refreshTokenRepo.findOne({
      where: { tokenHash },
      relations: { user: true },
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired, please log in again');
    }

    // Rotate: revoke the used token and issue a brand new pair. This limits
    // the blast radius if a refresh token is ever stolen — it's single-use.
    stored.revoked = true;
    await this.refreshTokenRepo.save(stored);

    const tokens = await this.issueTokenPair(stored.user, ctx);
    return { user: this.toPublicUser(stored.user), ...tokens };
  }

  async logout(rawRefreshToken: string) {
    const tokenHash = hashToken(rawRefreshToken);
    await this.refreshTokenRepo.update({ tokenHash }, { revoked: true });
  }

  async logoutAllDevices(userId: string) {
    await this.refreshTokenRepo.update(
      { userId, revoked: false },
      { revoked: true },
    );
  }

  async verifyEmail(rawToken: string) {
    const tokenHash = hashToken(rawToken);
    const record = await this.emailTokenRepo.findOne({
      where: { tokenHash },
      relations: { user: true },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException(
        'This verification link is invalid or has expired',
      );
    }

    record.usedAt = new Date();
    await this.emailTokenRepo.save(record);

    record.user.emailVerified = true;
    record.user.status = UserStatus.ACTIVE;
    await this.usersService.save(record.user);

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    // Always respond the same way whether or not the user exists, so this
    // endpoint can't be used to enumerate registered email addresses.
    if (user) {
      const rawToken = generateSecureToken();
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await this.resetTokenRepo.save(
        this.resetTokenRepo.create({ userId: user.id, tokenHash, expiresAt }),
      );

      await this.queueService.enqueueEmail({
        to: user.email,
        subject: 'Reset your Bandwise password',
        text: `Use this token to reset your password: ${rawToken}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.`,
      });
    }
    return { message: 'If that email exists, a reset link has been sent' };
  }

  async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = hashToken(rawToken);
    const record = await this.resetTokenRepo.findOne({
      where: { tokenHash },
      relations: { user: true },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException(
        'This reset link is invalid or has expired',
      );
    }

    record.usedAt = new Date();
    await this.resetTokenRepo.save(record);

    record.user.passwordHash = await argon2.hash(newPassword);
    await this.usersService.save(record.user);

    // Any stolen refresh tokens become useless the moment the password changes.
    await this.logoutAllDevices(record.user.id);

    return { message: 'Password updated successfully' };
  }

  // ---------------------------------------------------------------------

  private async issueTokenPair(
    user: User,
    ctx: RequestContext,
  ): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- 'ms' StringValue is a template-literal type that can't statically match a runtime-loaded env string
      expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN') as any,
    });

    const rawRefreshToken = generateSecureToken();
    const refreshDays =
      this.config.get<number>('JWT_REFRESH_EXPIRES_IN_DAYS') ?? 30;
    const expiresAt = new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000);

    await this.refreshTokenRepo.save(
      this.refreshTokenRepo.create({
        userId: user.id,
        tokenHash: hashToken(rawRefreshToken),
        expiresAt,
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      }),
    );

    return { accessToken, refreshToken: rawRefreshToken };
  }

  private async issueEmailVerificationToken(userId: string) {
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.emailTokenRepo.save(
      this.emailTokenRepo.create({
        userId,
        tokenHash: hashToken(token),
        expiresAt,
      }),
    );

    return { token };
  }

  private toPublicUser(user: User) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role.name,
      emailVerified: user.emailVerified,
    };
  }

  // Housekeeping: called by a scheduled job (queues module) to purge dead rows.
  async purgeExpiredTokens() {
    const now = new Date();
    await this.refreshTokenRepo.delete({ expiresAt: LessThan(now) });
    await this.emailTokenRepo.delete({ expiresAt: LessThan(now) });
    await this.resetTokenRepo.delete({ expiresAt: LessThan(now) });
  }
}
