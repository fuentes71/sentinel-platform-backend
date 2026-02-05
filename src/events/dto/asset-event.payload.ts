import { EventType } from '../entities/event.entity';

export interface AssetEventPayload {
  eventId: string;
  assetId: string;
  type: EventType;
  value: string | number;
  timestamp: Date;
}
