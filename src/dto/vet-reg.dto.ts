/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  IsArray,
  IsEmail,
  IsEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class VetRegisterDto {
  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsEmail(
    {},
    {
      message: 'Geçersiz Mail',
    },
  )
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak',
  })
  password: string;

  @IsEmpty()
  veterinaryCertificate;

  photo;

  @IsArray()
  location: [number];
}
