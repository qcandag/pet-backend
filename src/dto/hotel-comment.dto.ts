/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsString } from 'class-validator';

export class HotelCommentDto {
  @IsString()
  commentText: string;
}
