import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreConfig } from './entities/store-config.entity';

@Injectable()
export class StoreConfigService {
  constructor(
    @InjectRepository(StoreConfig)
    private readonly repo: Repository<StoreConfig>,
  ) {}

  async get() {
    const [config] = await this.repo.find();
    return config;
  }

  async update(data: Partial<StoreConfig>) {
    let config = await this.get();
    if (!config) {
      config = this.repo.create(data);
    } else {
      Object.assign(config, data);
    }
    return this.repo.save(config);
  }
}
