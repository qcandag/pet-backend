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
} from '@nestjs/common';
import { CurrentUser } from '../../decorators/current-user';
import { PetService } from './pet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { PetRegisterDto } from '../../dto/pet-reg.dto';

@Controller('pet')
export class PetController {
  constructor(private readonly petService: PetService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('photo'))
  @Post('')
  async createPet(
    @CurrentUser() currentUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() petRegisterDto: PetRegisterDto,
  ) {
    return this.petService.createPet(petRegisterDto, file, currentUser._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  async returnPet(@CurrentUser() currentUser) {
    return this.petService.returnPet(currentUser._id);
  }
}
