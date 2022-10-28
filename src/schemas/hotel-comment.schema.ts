/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HotelCommentDocument = HotelComment & Document;

@Schema({
  timestamps: true,
})
export class HotelComment {
  @Prop({
    type: String,
    required: true,
  })
  user: string; // Yorum yapılan user

  @Prop({
    type: String,
    required: true,
  })
  userId: string; // Yorum yapan user

  @Prop({
    type: String,
    required: true,
  })
  commentText: string;

  @Prop({
    type: [String],
  })
  likes: [string];
}
export const HotelCommentSchema = SchemaFactory.createForClass(HotelComment);
