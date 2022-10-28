import { IsBoolean, IsEmpty, IsNumber, IsString } from 'class-validator';

export class PetRegisterDto {
  @IsString()
  type: string;

  @IsString()
  name: string;

  @IsString()
  gender: string;

  @IsString()
  age: string;

  @IsString()
  game: string;

  @IsString()
  neutered: string;

  @IsEmpty()
  photo: string;

  @IsString()
  address: string;

  @IsString()
  description: string;
}
