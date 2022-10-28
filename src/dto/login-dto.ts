import {
  IsArray,
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsEmail(
    {},
    {
      message: 'Geçersiz Mail',
    },
  )
  email: string;

  @IsString()
  password: string;
}
