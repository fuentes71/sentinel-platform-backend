export interface Alert {
  id: string;
  assetId: string;
  message: string;
  level: 'info' | 'warning' | 'critical';
  createdAt: Date;
  resolved: boolean;
}
