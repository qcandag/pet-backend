import { IsString } from 'class-validator';

export class SearchLocationsDto {
  @IsString()
  text: string;
}
