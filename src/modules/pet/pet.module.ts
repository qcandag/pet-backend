import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PetController } from './pet.controller';
import { PetService } from './pet.service';
import { Pet, PetSchema } from '../../schemas/pet.schema';

@Module({
  controllers: [PetController],
  imports: [MongooseModule.forFeature([{ name: Pet.name, schema: PetSchema }])],
  providers: [PetService],
})
export class PetModule {}
