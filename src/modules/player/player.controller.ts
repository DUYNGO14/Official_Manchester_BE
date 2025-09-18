// player.controller.ts
import { ImageValidationPipe } from '@/common/pipes/image-validation.pipe';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PlayerService } from './player.service';
import { TransformNumberInterceptor } from '@/common/interceptors/transform-number.interceptor';

@Controller('players')
@UseInterceptors(TransformNumberInterceptor)
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createPlayerDto: CreatePlayerDto,
    @UploadedFile(
      new ParseFilePipe({ fileIsRequired: false }),
      ImageValidationPipe,
    )
    image?: Express.Multer.File,
  ) {
    return await this.playerService.create(createPlayerDto, image);
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('position') position?: string,
    @Query('nationality') nationality?: string,
  ){
    return await this.playerService.findAll(page, limit, position, nationality);
  }

  @Get('search')
  async search(@Query('q') query: string){
    return await this.playerService.searchPlayers(query);
  }

  @Get('stats/position')
  async  getPlayersByPosition() {
    return await this.playerService.getPlayersByPosition();
  }

  @Get(':id')
  async findOne(@Param('id') id: string){
    return await this.playerService.findOne(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return await this.playerService.findBySlug(slug);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePlayerDto: UpdatePlayerDto,
  ) {
    return await this.playerService.update(id, updatePlayerDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string){
    return await this.playerService.remove(id);
  }
}
