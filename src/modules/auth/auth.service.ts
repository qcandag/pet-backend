import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as aws from 'aws-sdk';
import { UserService } from '../user/user.service';
import { User, UserDocument } from '../../schemas/user.schema';
import { HttpService } from '@nestjs/axios';

export interface AuthResult {
  user: Record<string, any>;
  accessToken: string;
}
@Injectable()
export class AuthService {
  s3;
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly httpService: HttpService,
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

  async validateUser(email, password) {
    const user = await this.userService.findOne(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(user: any): Promise<AuthResult> {
    const payload = { email: user.email, _id: user._id };
    return {
      user,
      accessToken: this.jwtService.sign(payload),
    };
  }

  async genHashPassword(password: string) {
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(password, salt);
    return hashedPass;
  }

  async userRegister(registerDto): Promise<AuthResult> {
    const valid = await this.userModel.exists({ email: registerDto.email });
    if (valid === null) {
      registerDto.password = await this.genHashPassword(registerDto.password);
      const user = new this.userModel(registerDto);
      user.type = 'NORMAL';
      registerDto.location = registerDto.location.map(Number);
      user.location = { type: 'Point', coordinates: registerDto.location };
      await user.save();

      const payload = { phone: user.email, _id: user._id };
      return {
        user,
        accessToken: this.jwtService.sign(payload),
      };
    }
    throw new BadRequestException('Bu mail adresi daha önce kullanılmış!');
  }

  async vetRegister(registerDto, file) {
    const valid = await this.userModel.exists({ email: registerDto.email });
    if (valid === null) {
      registerDto.password = await this.genHashPassword(registerDto.password);
      const { Location } = await this.s3
        .upload({
          Key: `certificates/${file.originalname}`,
          Body: file.buffer,
          ContentType: 'image/png',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
        .promise();
      const vetUser = new this.userModel(registerDto);
      vetUser.type = 'VET';
      registerDto.location = registerDto.location.map(Number);
      vetUser.location = { type: 'Point', coordinates: registerDto.location };
      vetUser.veterinaryCertificate = Location;

      await vetUser.save();

      const payload = { phone: vetUser.email, _id: vetUser._id };
      return {
        vetUser,
        accessToken: this.jwtService.sign(payload),
      };
    }
    throw new BadRequestException('Bu mail adresi daha önce kullanılmış!');
  }

  async hotelRegister(registerDto, files) {
    const valid = await this.userModel.exists({ email: registerDto.email });
    if (valid === null) {
      registerDto.password = await this.genHashPassword(registerDto.password);
      registerDto.location = registerDto.location.map(Number);
      const hotelUser = new this.userModel(registerDto);
      hotelUser.type = 'HOTEL';
      hotelUser.location = {
        type: 'Point',
        coordinates: registerDto.location,
      };

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

          await hotelUser.photos.push(Location);

          y++;
          break;
        }
      }
      await hotelUser.save();
      const payload = { phone: hotelUser.email, _id: hotelUser._id };
      return {
        hotelUser,
        accessToken: this.jwtService.sign(payload),
      };
    }
    throw new BadRequestException('Bu mail adresi daha önce kullanılmış!');
  }

  async searchLocations(text) {
    const locationDetail = await this.httpService
      .get(
        `https://nominatim.openstreetmap.org/search/${text}?format=json&addressdetails=1&limit=10&polygon_svg=1`,
      )
      .toPromise();
    return locationDetail.data;
  }
}
