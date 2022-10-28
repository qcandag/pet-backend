import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import * as aws from 'aws-sdk';
import { Pet, PetDocument } from '../../schemas/pet.schema';
@Injectable()
export class PetService {
  s3;
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Pet.name) private readonly petModel: Model<PetDocument>,
  ) {
    this.s3 = new aws.S3({
      params: { Bucket: configService.get('S3_BUCKET_NAME') },
      region: 'eu-central-1',
      accessKeyId: configService.get('S3_ACCESS_ID'),
      secretAccessKey: configService.get('S3_SECRET_ACCESS_KEY'),
      s3BucketEndpoint: false,
      endpoint: 'https://s3-eu-central-1.amazonaws.com',
    });
  }

  async createPet(petRegisterDto, file, currentUser) {
    const { Location } = await this.s3
      .upload({
        Key: `pets/${file.originalname}`,
        Body: file.buffer,
        ContentType: 'image/png',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .promise();

    const pet = new this.petModel(petRegisterDto);
    pet.photo = Location;
    pet.owner = currentUser;

    await pet.save();

    return pet;
  }

  async returnPet(currentUser) {
    const pets = await this.petModel
      .find({
        owner: currentUser,
      })
      .lean();

    return pets;
  }
}
