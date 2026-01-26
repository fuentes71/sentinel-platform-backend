export class AssetEventPayload {
  eventId: string;

  assetId: string;

  type: 'status' | 'metric' | 'alert';

  value?: number | string;

  timestamp: Date;
}
