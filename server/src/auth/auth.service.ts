import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';


@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private cfg: ConfigService,
    @InjectPinoLogger(AuthService.name) private readonly logger: PinoLogger
  ) {}

  async signup(email: string, name: string, password: string) {
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    try {
      const user = await this.users.create(email, name, passwordHash);
      const tokens = await this.issueTokens(user.id, user.email);
      this.logger.info({ email: email }, 'signup.success');
      return { user: user.toJSON(), ...tokens };
    } catch (e) {
      if (e instanceof ConflictException) {
        this.logger.warn({ email: email }, 'signup.duplicate_email');
        throw e;
      }
      this.logger.error({ err: e, email: email }, 'signup.error');
      throw e;
    }
  }

  async signin(email: string, password: string) {
    this.logger.info({ email: email }, 'signin.attempt');
    const user = await this.users.findByEmail(email);
    if (!user) {
      this.logger.warn({ email: email }, 'signin.failed.invalid_credentials');
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) {
      this.logger.warn({ userId: user.id, email: email }, 'signin.failed.invalid_credentials');
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens(user.id, user.email);
    this.logger.info({ userId: user.id }, 'signin.success');
    return { user: user.toJSON(), ...tokens };
  }

  async refresh(userId: string, email: string) {
    this.logger.debug({ userId: userId, email: email }, 'refresh.attempt');    
    const tokens = await this.issueTokens(userId, email); // simple rotation
    this.logger.info({ userId: userId, email: email }, 'refresh.success');
    return tokens;
  }

  private async issueTokens(sub: string, email: string) {
    const accessTtl = this.cfg.get<string>('ACCESS_TOKEN_TTL') ?? '15m';
    const refreshTtl = this.cfg.get<string>('REFRESH_TOKEN_TTL') ?? '7d';
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync({ sub, email }, { secret: this.cfg.get('JWT_ACCESS_SECRET'), expiresIn: accessTtl }),
      this.jwt.signAsync({ sub, email }, { secret: this.cfg.get('JWT_REFRESH_SECRET'), expiresIn: refreshTtl }),
    ]);
    return { accessToken, refreshToken };
  }
}
