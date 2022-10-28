/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PostEnum } from '../enum/post.enum';

export class PostDto {
  @IsString()
  type: PostEnum;

  @IsString()
  text: string;
}
