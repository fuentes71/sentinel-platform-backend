export interface AlertResolvedPayload {
  alertId: string;
  assetId: string;
  resolvedBy: string | null;
  resolvedAt: string;
}
