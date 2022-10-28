/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type UserDocument = User & Document;
@Schema({
  timestamps: true,
})
export class User {
  @Prop({
    type: String,
    required: true,
  })
  type: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  email: string;

  @Prop({
    type: String,
    required: true,
  })
  firstname: string;

  @Prop({
    type: String,
    required: true,
  })
  lastname: string;

  @Prop({
    type: String,
    required: true,
  })
  password: string;

  @Prop({
    type: String,
  })
  veterinaryCertificate: string;

  @Prop({
    type: String,
  })
  roomCount: string;

  @Prop({
    type: [String],
  })
  photos: [string];

  @Prop({
    type: String,
    default: '',
  })
  photo: string;

  @Prop({
    type: Object,
    required: true,
  })
  location: any;
}
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ location: '2dsphere' });
