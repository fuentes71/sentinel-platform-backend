import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  assetId: string;

  @IsIn(['status', 'metric'])
  type: 'status' | 'metric';

  @IsNotEmpty()
  value: number | string;
}
