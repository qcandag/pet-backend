/* eslint-disable @typescript-eslint/no-unused-vars */
// import {
//   IsArray,
//   IsEmail,
//   IsEmpty,
//   IsString,
//   Matches,
//   MaxLength,
//   MinLength,
// } from 'class-validator';

export class VetUpdateDto {
  firstname: string;

  lastname: string;

  email: string;

  password: string;

  location: [number];
}
