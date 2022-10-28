import { BadRequestException, Injectable } from '@nestjs/common';
import { User, UserDocument } from '../../schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as aws from 'aws-sdk';
import * as bcrypt from 'bcrypt';
import {
  HotelComment,
  HotelCommentDocument,
} from '../../schemas/hotel-comment.schema';

@Injectable()
export class UserService {
  s3;
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(HotelComment.name)
    private readonly hotelCommentModel: Model<HotelCommentDocument>,
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

  async findOne(email: string): Promise<User | undefined> {
    return await this.userModel.findOne({ email });
  }

  async genHashPassword(password) {
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(password, salt);
    return hashedPass;
  }

  async updateNormalUser(updateDto, currentUser) {
    const valid = await this.userModel.exists({ email: updateDto.email });
    if (!(valid === null)) {
      throw new BadRequestException('Bu mail adresi daha önce kullanılmış!');
    }
    if (updateDto.password) {
      updateDto.password = await this.genHashPassword(updateDto.password);
      if (updateDto.location) {
        updateDto.location = updateDto.location.map(Number);
      }
      return await this.userModel.findOneAndUpdate(
        { email: currentUser },
        updateDto,
        { new: true },
      );
    }

    const updatedUser = await this.userModel.findOneAndUpdate(
      { email: currentUser },
      updateDto,
      { new: true },
    );
    return updatedUser;
  }

  async updateVetUser(updateDto, file, currentUser) {
    const valid = await this.userModel.exists({ email: updateDto.email });
    if (!(valid === null)) {
      throw new BadRequestException('Bu mail adresi daha önce kullanılmış!');
    }
    if (file === undefined) {
      if (updateDto.password) {
        updateDto.password = await this.genHashPassword(updateDto.password);
        if (updateDto.location) {
          updateDto.location = updateDto.location.map(Number);
        }
        const updatedUser = await this.userModel.findOneAndUpdate(
          { email: currentUser },
          updateDto,
          { new: true },
        );
        return updatedUser;
      }
      if (updateDto.location) {
        updateDto.location = updateDto.location.map(Number);
      }
      const updatedUser = await this.userModel.findOneAndUpdate(
        { email: currentUser },
        updateDto,
        { new: true },
      );
      return updatedUser;
    }
    /////
    if (updateDto.password) {
      updateDto.password = await this.genHashPassword(updateDto.password);
      updateDto.veterinaryCertificate = '';
      const { Location } = await this.s3
        .upload({
          Key: `certificates/${file.originalname}`,
          Body: file.buffer,
          ContentType: 'image/png',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
        .promise();
      updateDto.veterinaryCertificate = Location;
      if (updateDto.location) {
        updateDto.location = updateDto.location.map(Number);
      }
      const updatedUser = await this.userModel.findOneAndUpdate(
        { email: currentUser },
        { updateDto },
        { new: true },
      );
      return updatedUser;
    }
    const { Location } = await this.s3
      .upload({
        Key: `certificates/${file.originalname}`,
        Body: file.buffer,
        ContentType: 'image/png',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .promise();
    updateDto.veterinaryCertificate = Location;
    if (updateDto.location) {
      updateDto.location = updateDto.location.map(Number);
    }
    const updatedUser = await this.userModel.findOneAndUpdate(
      { email: currentUser },
      updateDto,
      { new: true },
    );
    return updatedUser;
  }

  async updateHotelUser(updateDto, files, currentUser) {
    const valid = await this.userModel.exists({ email: updateDto.email });
    if (!(valid === null)) {
      throw new BadRequestException('Bu mail adresi daha önce kullanılmış!');
    }
    if (files === undefined || files.length < 1) {
      if (updateDto.password) {
        updateDto.password = await this.genHashPassword(updateDto.password);
        if (updateDto.location) {
          updateDto.location = updateDto.location.map(Number);
        }
        const updatedUser = await this.userModel.findOneAndUpdate(
          { email: currentUser },
          updateDto,
          { new: true },
        );
        return updatedUser;
      }
      if (updateDto.location) {
        updateDto.location = updateDto.location.map(Number);
      }
      const updatedUser = await this.userModel.findOneAndUpdate(
        { email: currentUser },
        updateDto,
        { new: true },
      );
      return updatedUser;
    }
    if (updateDto.password) {
      updateDto.password = await this.genHashPassword(updateDto.password);

      const user = await this.userModel.findOne({ email: currentUser });
      const userUrl = user.photos;

      for (const i of userUrl) {
        await this.userModel.updateOne(
          { email: currentUser },
          { $pull: { photos: i } },
        );
      }

      let x = 0;
      let y = 0;
      for (x; x < files.length; ) {
        const imageBuffer = files[x].buffer;
        x++;
        for (y; y < files.length; y++) {
          const imageName = files[y].originalname;

          const { Location } = await this.s3
            .upload({
              Key: `hotelPhotos/${imageName}`,
              Body: imageBuffer,
              ContentType: 'image/png',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any)
            .promise();
          await this.userModel.findOneAndUpdate(
            {
              email: currentUser,
            },
            { $push: { photos: Location } },
          );

          y++;
          break;
        }
      }
      if (updateDto.location) {
        updateDto.location = updateDto.location.map(Number);
      }
      const updatedUser = await this.userModel.findOneAndUpdate(
        { email: currentUser },
        updateDto,
        { new: true },
      );
      return updatedUser;
    }

    const user = await this.userModel.findOne({ email: currentUser });
    const userUrl = user.photos;

    for (const i of userUrl) {
      await this.userModel.updateOne(
        { email: currentUser },
        { $pull: { photos: i } },
      );
    }

    let x = 0;
    let y = 0;
    for (x; x < files.length; ) {
      const imageBuffer = files[x].buffer;
      x++;
      for (y; y < files.length; y++) {
        const imageName = files[y].originalname;

        const { Location } = await this.s3
          .upload({
            Key: `hotelPhotos/${imageName}`,
            Body: imageBuffer,
            ContentType: 'image/png',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any)
          .promise();
        await this.userModel.findOneAndUpdate(
          {
            email: currentUser,
          },
          { $push: { photos: Location } },
        );

        y++;
        break;
      }
    }
    if (updateDto.location) {
      updateDto.location = updateDto.location.map(Number);
    }
    const updatedUser = await this.userModel.findOneAndUpdate(
      { email: currentUser },
      updateDto,
      { new: true },
    );
    return updatedUser;
  }

  async setPhoto(file, currentUser) {
    try {
      const { Location } = await this.s3
        .upload({
          Key: `profilephotos/${file.originalname}`,
          Body: file.buffer,
          ContentType: 'image/png',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
        .promise();

      await this.userModel.findOneAndUpdate(
        {
          email: currentUser,
        },
        { photo: Location },
      );

      return true;
    } catch (err) {
      return false;
    }
  }

  async getVets(page, currentUser) {
    const user = await this.userModel.findOne({ currentUser });
    const userLoc = user.location;
    const closeVets = await this.userModel.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [userLoc[0], userLoc[1]],
          },
          key: 'location',
          distanceField: 'dist.calculated',
          query: { type: 'VET' },
          includeLocs: 'dist.location',
          spherical: true,
        },
      },
      {
        $sort: {
          dist: 1,
        },
      },
      {
        $skip: page * 20,
      },
      {
        $limit: 20,
      },
    ]);

    return closeVets;
  }

  async getUser(userId: string) {
    const user = await this.userModel.findById(userId);

    return user;
  }

  async postHotelComment(commentText, userId, currentUser) {
    const hotelComment = new this.hotelCommentModel(commentText);
    hotelComment.user = userId;
    hotelComment.userId = currentUser;
    await hotelComment.save();

    return hotelComment;
  }

  async putHotelCommentLike(commentId, currentUser) {
    const commentLike = await this.hotelCommentModel.updateOne(
      { _id: commentId },
      { $push: { likes: currentUser } },
      { new: true },
    );
    return commentLike;
  }

  async deleteHotelCommentLike(commmentId, currentUser) {
    const commentLike = await this.hotelCommentModel.updateOne(
      { _id: commmentId },
      { $pull: { likes: currentUser } },
      { new: true },
    );

    return commentLike;
  }

  async getHotelComments(hotelId: string) {
    const HotelComments = await this.hotelCommentModel.find({ user: hotelId });

    return HotelComments;
  }
}
