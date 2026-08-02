import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepo: Repository<Role>,
  ) {}

  async findAll(params: { search?: string; roleId?: string; isActive?: boolean }) {
    const query = this.usersRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('user.role != :customer', { customer: UserRole.CUSTOMER })
      .orderBy('user.createdAt', 'DESC');

    if (params.search) {
      query.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', {
        search: `%${params.search}%`,
      });
    }
    if (params.isActive !== undefined) {
      query.andWhere('user.isActive = :isActive', { isActive: params.isActive });
    }
    if (params.roleId) {
      query.andWhere('role.id = :roleId', { roleId: params.roleId });
    }

    const users = await query.getMany();
    return users.map((u) => this.toSafeUser(u));
  }

  async findAssignable() {
    const users = await this.usersRepo.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
    return users
      .filter((u) => u.role !== UserRole.CUSTOMER)
      .map((u) => ({ id: u.id, name: u.name, email: u.email }));
  }

  async findOne(id: string) {
    const user = await this.usersRepo.findOne({ where: { id }, relations: ['roles'] });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.toSafeUser(user);
  }

  private async resolveRoles(roleIds: string[]) {
    if (roleIds.length === 0) {
      throw new BadRequestException('Debes asignar al menos un rol');
    }
    const roles = await this.rolesRepo.find({ where: { id: In(roleIds) } });
    if (roles.length !== roleIds.length) {
      throw new BadRequestException('Uno o más roles seleccionados no existen');
    }
    return roles;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Ya existe un usuario con ese correo');

    const roles = await this.resolveRoles(dto.roleIds);
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepo.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      role: UserRole.STAFF,
      roles,
    });
    const saved = await this.usersRepo.save(user);
    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.usersRepo.findOne({ where: { id }, relations: ['roles'] });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (dto.email && dto.email !== user.email) {
      const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
      if (existing) throw new ConflictException('Ya existe un usuario con ese correo');
      user.email = dto.email;
    }
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    if (dto.roleIds !== undefined) user.roles = await this.resolveRoles(dto.roleIds);

    await this.usersRepo.save(user);
    return this.findOne(id);
  }

  async setActive(id: string, isActive: boolean, requesterId: string) {
    if (id === requesterId && !isActive) {
      throw new BadRequestException('No puedes desactivar tu propia cuenta');
    }
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.isActive = isActive;
    await this.usersRepo.save(user);
    return this.findOne(id);
  }

  async resetPassword(id: string, newPassword: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersRepo.save(user);
    return { ok: true };
  }

  async remove(id: string, requesterId: string) {
    if (id === requesterId) {
      throw new BadRequestException('No puedes eliminar tu propia cuenta');
    }
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('No se puede eliminar la cuenta administradora original');
    }
    await this.usersRepo.remove(user);
    return { ok: true };
  }

  private toSafeUser(user: User) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
