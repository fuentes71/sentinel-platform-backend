export interface AlertCreatedPayload {
  alertId: string;
  assetId: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  createdAt: string;
}
