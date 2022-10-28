import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Module } from '@ntegral/nestjs-s3';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PetModule } from './modules/pet/pet.module';
import { PostsModule } from './modules/posts/posts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URI'),
      }),
      inject: [ConfigService],
    }),
    S3Module.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        region: 'eu-central-1',
        sessionToken: null,
        accessKeyId: configService.get('S3_ACCESS_KEY'),
        secretAccessKey: configService.get('S3_SECRET_KEY'),
        s3BucketEndpoint: false,
        endpoint: 'https://s3-eu-central-1.amazonaws.com',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    PetModule,
    PostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
