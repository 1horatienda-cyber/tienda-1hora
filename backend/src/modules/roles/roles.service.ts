import { BadRequestException, ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { DEFAULT_ROLES, PERMISSIONS } from './permissions.constant';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepo: Repository<Role>,
  ) {}

  // Crea los roles semilla (Administrador, Operador, Atención al Cliente) la primera vez que arranca el backend.
  async onModuleInit() {
    for (const seed of DEFAULT_ROLES) {
      const existing = await this.rolesRepo.findOne({ where: { name: seed.name } });
      if (!existing) {
        await this.rolesRepo.save(
          this.rolesRepo.create({
            name: seed.name,
            description: seed.description,
            permissions: seed.permissions,
            isSystem: true,
          }),
        );
      }
    }
  }

  getPermissionsCatalog() {
    return PERMISSIONS;
  }

  findAll() {
    return this.rolesRepo.find({ order: { createdAt: 'ASC' } });
  }

  async findOne(id: string) {
    const role = await this.rolesRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Rol no encontrado');
    return role;
  }

  // Usado por el bootstrap del admin para asegurarse de que el rol "Administrador" exista.
  async getSystemRoleByName(name: string) {
    const role = await this.rolesRepo.findOne({ where: { name } });
    if (!role) throw new NotFoundException(`Rol semilla "${name}" no encontrado`);
    return role;
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.rolesRepo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Ya existe un rol con ese nombre');
    const role = this.rolesRepo.create({
      name: dto.name,
      description: dto.description,
      permissions: dto.permissions,
    });
    return this.rolesRepo.save(role);
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.findOne(id);
    if (dto.name && dto.name !== role.name) {
      const existing = await this.rolesRepo.findOne({ where: { name: dto.name } });
      if (existing) throw new ConflictException('Ya existe un rol con ese nombre');
      role.name = dto.name;
    }
    if (dto.description !== undefined) role.description = dto.description;
    if (dto.permissions !== undefined) role.permissions = dto.permissions;
    return this.rolesRepo.save(role);
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    if (role.isSystem) {
      throw new BadRequestException('Los roles predeterminados no se pueden eliminar');
    }
    await this.rolesRepo.remove(role);
    return { ok: true };
  }
}
