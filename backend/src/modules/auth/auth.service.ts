import { BadRequestException, Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import { User, UserRole } from '../users/entities/user.entity';
import { RolesService } from '../roles/roles.service';
import { computeEffectivePermissions } from '../roles/permissions.util';
import { MailService } from '../mail/mail.service';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly rolesService: RolesService,
    private readonly mailService: MailService,
  ) {}

  // Al arrancar el backend, crea el usuario administrador si no existe todavía,
  // usando las credenciales definidas en las variables de entorno, y se asegura
  // de que esté vinculado al rol "Administrador" (útil para mostrarlo en el panel de usuarios).
  async onModuleInit() {
    const email = this.configService.get<string>('ADMIN_EMAIL');
    const password = this.configService.get<string>('ADMIN_PASSWORD');
    if (!email || !password) return;

    const adminRole = await this.rolesService.getSystemRoleByName('Administrador');

    let user = await this.usersRepo.findOne({ where: { email }, relations: ['roles'] });
    if (!user) {
      const passwordHash = await bcrypt.hash(password, 10);
      user = this.usersRepo.create({
        name: 'Administrador',
        email,
        passwordHash,
        role: UserRole.ADMIN,
        roles: [adminRole],
      });
      await this.usersRepo.save(user);
      console.log(`Usuario administrador creado: ${email}`);
      return;
    }

    if (!user.roles?.some((r) => r.id === adminRole.id)) {
      user.roles = [...(user.roles ?? []), adminRole];
      await this.usersRepo.save(user);
    }
  }

  async login(email: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { email }, relations: ['roles'] });
    if (!user) throw new UnauthorizedException('Credenciales incorrectas');
    if (!user.isActive) throw new UnauthorizedException('Esta cuenta está desactivada');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciales incorrectas');

    user.lastLoginAt = new Date();
    await this.usersRepo.save(user);

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });
    const permissions = computeEffectivePermissions(user);
    return {
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, permissions },
    };
  }

  // Cualquier usuario logueado puede cambiar su propia contraseña, sin necesitar
  // el permiso "users.edit" (ese permiso es para restablecer la de OTROS).
  async changeOwnPassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('La contraseña actual no es correcta');

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersRepo.save(user);
    return { ok: true };
  }

  // Genera un enlace de recuperación de un solo uso y lo "envía" por correo (o lo deja
  // en el log del servidor si todavía no hay SMTP configurado — ver MailService).
  // Responde siempre con el mismo mensaje exista o no el correo, para no filtrar
  // qué correos están registrados en el sistema.
  async forgotPassword(email: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (user) {
      const rawToken = randomBytes(32).toString('hex');
      user.passwordResetTokenHash = createHash('sha256').update(rawToken).digest('hex');
      user.passwordResetExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      await this.usersRepo.save(user);

      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      const link = `${frontendUrl}/admin/reset-password?email=${encodeURIComponent(email)}&token=${rawToken}`;
      await this.mailService.sendPasswordResetEmail(email, link);
    }
    return { message: 'Si el correo existe en el sistema, te enviamos instrucciones para recuperar tu contraseña.' };
  }

  async resetPasswordWithToken(email: string, token: string, newPassword: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    const invalidLinkError = new BadRequestException('El enlace no es válido o ya expiró. Solicita uno nuevo.');

    if (!user || !user.passwordResetTokenHash || !user.passwordResetExpiresAt) {
      throw invalidLinkError;
    }
    if (user.passwordResetExpiresAt.getTime() < Date.now()) {
      throw invalidLinkError;
    }
    const tokenHash = createHash('sha256').update(token).digest('hex');
    if (tokenHash !== user.passwordResetTokenHash) {
      throw invalidLinkError;
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await this.usersRepo.save(user);
    return { ok: true };
  }

  async me(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId }, relations: ['roles'] });
    if (!user) throw new UnauthorizedException();
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roles: user.roles?.map((r) => ({ id: r.id, name: r.name })) ?? [],
      permissions: computeEffectivePermissions(user),
    };
  }
}
