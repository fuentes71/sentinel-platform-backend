export class Event {
  id: string;
  assetId: string;
  type: 'status' | 'metric';
  value: number | string;
  timestamp: Date;
}
