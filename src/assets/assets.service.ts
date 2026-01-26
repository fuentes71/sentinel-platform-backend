import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Asset } from './entities/asset.entity';

@Injectable()
export class AssetsService {
  private assets: Asset[] = [];

  create(name: string): Asset {
    const asset: Asset = {
      id: uuidv4(),
      name,
      status: 'offline',
      lastUpdate: new Date(),
    };

    this.assets.push(asset);
    return asset;
  }

  findAll(): Asset[] {
    return this.assets;
  }

  findById(id: string): Asset | undefined {
    return this.assets.find((asset) => asset.id === id);
  }

  updateStatus(id: string, status: Asset['status']) {
    const asset = this.findById(id);
    if (!asset) {
      return null;
    }

    asset.status = status;
    asset.lastUpdate = new Date();
    return asset;
  }

  remove(id: string): void {
    this.assets = this.assets.filter((asset) => asset.id !== id);
  }
}
