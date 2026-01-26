export class Asset {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning';
  lastUpdate: Date;
}
