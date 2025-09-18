import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '@/common/dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageValidationPipe } from '@/common/pipes/image-validation.pipe';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    const result = this.usersService.findAll(
      query.page,
      query.limit,
      query.search,
      query.sort,
      query.order,
    );
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatar'))
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile(
      new ParseFilePipe({ fileIsRequired: false }),
      ImageValidationPipe,
    )
    file?: Express.Multer.File,
  ) {
    return await this.usersService.update(
      id,
      updateUserDto,
      file as Express.Multer.File,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }
}
