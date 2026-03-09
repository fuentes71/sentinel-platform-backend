import { BadRequestException, Injectable } from '@nestjs/common';
import { Asset } from './entities/asset.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async create(name: string): Promise<Asset> {
    const safeName = (name ?? '').trim();
    if (!safeName) {
      throw new BadRequestException('Nome do asset é obrigatório');
    }

    const asset = await this.prisma.asset.create({
      data: {
        name: safeName,
        status: 'online',
        lastUpdate: new Date(),
      },
    });

    return asset as Asset;
  }

  async findAll(): Promise<Asset[]> {
    return (await this.prisma.asset.findMany()) as Asset[];
  }

  async findById(id: string): Promise<Asset | null> {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    return asset ? (asset as Asset) : null;
  }

  async updateStatus(
    assetId: string,
    status: string,
    timestamp: Date = new Date(),
  ): Promise<Asset | null> {
    try {
      const asset = await this.prisma.asset.update({
        where: { id: assetId },
        data: {
          status,
          lastUpdate: timestamp instanceof Date ? timestamp : new Date(),
        },
      });

      return asset as Asset;
    } catch {
      return null;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.asset.delete({ where: { id } });
    } catch {
      // Ignore if not found
    }
  }
}
