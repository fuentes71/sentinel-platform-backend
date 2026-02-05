import { BadRequestException, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Asset } from './entities/asset.entity';

@Injectable()
export class AssetsService {
  private assets: Asset[] = [];

  create(name: string): Asset {
    const safeName = (name ?? '').trim();
    if (!safeName) {
      throw new BadRequestException('Nome do asset é obrigatório');
    }

    const asset: Asset = {
      id: uuidv4(),
      name: safeName,
      status: 'online',
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

  updateStatus(
    assetId: string,
    status: Asset['status'],
    timestamp: Date = new Date(),
  ): Asset | null {
    const asset = this.findById(assetId);
    if (!asset) return null;

    asset.status = status;
    asset.lastUpdate = timestamp instanceof Date ? timestamp : new Date();

    return asset;
  }

  remove(id: string): void {
    this.assets = this.assets.filter((asset) => asset.id !== id);
  }
}
