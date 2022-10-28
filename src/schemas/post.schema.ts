/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PostEnum } from '../enum/post.enum';
export type PostDocument = Post & Document;
@Schema({
  timestamps: true,
})
export class Post {
  @Prop({
    enum: PostEnum,
    required: true,
  })
  type: PostEnum;

  @Prop({
    type: String,
    required: true,
  })
  user: string;

  @Prop({
    type: String,
    required: true,
  })
  text: string;

  @Prop({
    type: [String],
  })
  likes: [string];

  @Prop({
    type: [String],
  })
  photos: [string];
}
export const PostSchema = SchemaFactory.createForClass(Post);
