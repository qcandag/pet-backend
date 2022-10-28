import {
  Controller,
  UseGuards,
  Body,
  Req,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Get,
  Query,
  Put,
  BadRequestException,
  Param,
  Post,
  Delete,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { UserService } from './user.service';
import { CurrentUser } from '../../decorators/current-user';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserUpdateDto } from '../../dto/user-upd.dto';
import { VetUpdateDto } from '../../dto/vet-upd.dto';
import { HotelUpdateDto } from '../../dto/hotel-upd.dto';
import { imageFileFilter } from '../auth/file-helper';
import { HotelCommentDto } from '../../dto/hotel-comment.dto';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Put('normal-user')
  async updateNormalUser(
    @Body() updateDto: UserUpdateDto,
    @CurrentUser() currentUser,
  ) {
    return this.userService.updateNormalUser(updateDto, currentUser.email);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('veterinaryCertificate'))
  @Put('vet-user')
  async updateVetUser(
    @Body() updateDto: VetUpdateDto,
    @CurrentUser() currentUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.updateVetUser(updateDto, file, currentUser.email);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('photos'))
  @Put('hotel-user')
  async updateHotelUser(
    @Body() updateDto: HotelUpdateDto,
    @CurrentUser() currentUser,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.userService.updateHotelUser(
      updateDto,
      files,
      currentUser.email,
    );
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('photo', {
      fileFilter: imageFileFilter,
    }),
  )
  @Put('/photo')
  async setPhoto(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser,
  ) {
    if (!file || req.fileValidationError) {
      throw new BadRequestException(
        'invalid file provided, [image files allowed]',
      );
    }
    return this.userService.setPhoto(file, currentUser.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('vets')
  async getVets(@Query('page') page: number, @CurrentUser() currentUser) {
    return this.userService.getVets(page, currentUser);
  }

  @Get(':userId')
  async getUser(@Param('userId') userId: string) {
    return this.userService.getUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':userId/hotel-comments')
  async postHotelComment(
    @Param('userId') userId: string,
    @CurrentUser() currentUser,
    @Body() commentText: HotelCommentDto,
  ) {
    return this.userService.postHotelComment(
      commentText,
      userId,
      currentUser._id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:userId/hotel-comments/:commentId/like')
  async putHotelCommentLike(
    @Param('commentId') commmentId,
    @CurrentUser() currentUser,
  ) {
    return this.userService.putHotelCommentLike(commmentId, currentUser._id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:userId/hotel-comments/:commentId/like')
  async deleteHotelCommentLike(
    @Param('commentId') commmentId: string,
    @CurrentUser() currentUser,
  ) {
    return this.userService.deleteHotelCommentLike(commmentId, currentUser._id);
  }

  @Get(':userId/hotel-comments')
  async getHotelComments(@Param('userId') hotelId: string) {
    return this.userService.getHotelComments(hotelId);
  }
}
