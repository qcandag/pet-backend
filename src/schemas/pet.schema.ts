/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PetDocument = Pet & Document;

@Schema({
  timestamps: true,
})
export class Pet {
  @Prop({
    type: String,
    required: true,
  })
  type: string;

  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
  })
  gender: string; //enum ?

  @Prop({
    // number
    type: String,
    required: true,
  })
  age: string;

  @Prop({
    type: String,
    required: true,
  })
  game: string;

  @Prop({
    type: String,
    required: true,
  })
  neutered: string;

  @Prop({
    type: String,
    required: true,
  })
  breed: string;

  @Prop({
    type: String,
    required: true,
  })
  photo: string; // only one ?

  @Prop({
    type: String,
    required: true,
  })
  address: string;

  @Prop({
    type: String,
    required: true,
  })
  description: string;

  @Prop({
    type: String,
  })
  owner: string;
}
export const PetSchema = SchemaFactory.createForClass(Pet);
