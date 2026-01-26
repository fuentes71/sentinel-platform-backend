export interface Rule {
  id: string;
  assetId: string;
  condition: '>' | '<' | '=';
  threshold: number;
  enabled: boolean;
}
