/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostCommentDocument = PostComment & Document;

@Schema({
  timestamps: true,
})
export class PostComment {
  @Prop({
    type: String,
    required: true,
  })
  postId: string; // Yorum yapılan post

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
export const PostCommentSchema = SchemaFactory.createForClass(PostComment);
