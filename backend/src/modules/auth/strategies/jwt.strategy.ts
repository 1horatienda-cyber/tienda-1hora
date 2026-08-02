import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../../users/entities/user.entity';
import { computeEffectivePermissions } from '../../roles/permissions.util';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  // Se ejecuta en cada request autenticado: así, si desactivan al usuario o le cambian
  // los roles, el efecto es inmediato aunque su token siga siendo válido.
  async validate(payload: { sub: string; email: string }) {
    const user = await this.usersRepo.findOne({ where: { id: payload.sub }, relations: ['roles'] });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Cuenta inactiva o inexistente');
    }

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: computeEffectivePermissions(user),
    };
  }
}
