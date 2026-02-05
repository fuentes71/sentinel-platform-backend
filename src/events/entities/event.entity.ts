export type EventType = 'status' | 'metric' | 'system';

export type SystemEventValue =
  | 'asset_removed'
  | 'asset_created'
  | 'asset_locked_critical'
  | 'asset_unlocked';

export class Event {
  id: string;
  assetId: string;
  type: EventType;
  value: string | number;
  timestamp: Date;
}
