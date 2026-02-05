export class Rule {
  id: string;
  name?: string;
  assetId?: string;
  condition: '>' | '<' | '=';
  threshold: number;
  level?: 'medium' | 'strong';
  enabled: boolean;
}
