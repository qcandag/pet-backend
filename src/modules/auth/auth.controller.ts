import {
  Controller,
  Post,
  UseGuards,
  Body,
  UsePipes,
  ValidationPipe,
  Req,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { HotelRegisterDto } from '../../dto/hotel-reg.dto';
import { UserRegisterDto } from '../../dto/user-reg.dto';
import { VetRegisterDto } from '../../dto/vet-reg.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { imageFileFilter } from './file-helper';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(ValidationPipe)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req) {
    return this.authService.login(req.user);
  }

  @Post('register-user')
  async userRegister(@Body() registerDto: UserRegisterDto) {
    return this.authService.userRegister(registerDto);
  }

  @Post('register-vet')
  @UseInterceptors(
    FileInterceptor('veterinaryCertificate', {
      fileFilter: imageFileFilter,
    }),
  )
  async vetRegister(
    @Req() req: any,
    @Body() registerDto: VetRegisterDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file || req.fileValidationError) {
      throw new BadRequestException(
        'invalid file provided, [image files allowed]',
      );
    }
    return this.authService.vetRegister(registerDto, file);
  }

  @Post('register-hotel')
  @UseInterceptors(
    FilesInterceptor('photos', 6, {
      fileFilter: imageFileFilter,
    }),
  )
  async hotelRegister(
    @Req() req: any,
    @Body() registerDto: HotelRegisterDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (!files || req.fileValidationError) {
      throw new BadRequestException(
        'invalid file provided, [image files allowed]',
      );
    }
    return this.authService.hotelRegister(registerDto, files);
  }

  @Get('search-locations')
  async searchLocations(@Query('text') text: string) {
    return this.authService.searchLocations(text);
  }
}
