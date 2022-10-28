/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  IsArray,
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserUpdateDto {
  firstname: string;

  lastname: string;

  email: string;

  password: string;

  location: [number];
}
