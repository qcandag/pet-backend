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

export class HotelUpdateDto {
  firstname: string;

  lastname: string;

  email: string;

  password: string;

  roomCount: string;

  location: [number];
}
