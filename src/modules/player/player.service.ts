// player.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player, PlayerDocument } from './schemas/player.schema';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import {
  ApiResponseError,
  ApiResponsePaginateResponse,
  ApiResponseSuccess,
  BaseResponse,
  PaginatedData,
} from '@/common/helper/base_response';
import { UploadService } from '@/modules/upload/upload.service';

@Injectable()
export class PlayerService {
  constructor(
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
    private readonly uploadService: UploadService,
  ) {}

  async create(
    createPlayerDto: CreatePlayerDto,
    image?: Express.Multer.File,
  ): Promise<BaseResponse<Player>> {
    let newAvatarPublicId: string | null = null;
    try {
      const playerData = { ...createPlayerDto };
      if (image) {
        try {
          const upload = await this.uploadService.uploadSingleImage(image, {
            folder: 'avatar-players',
          });
          playerData.image = upload.url;
        } catch (uploadError) {
          return ApiResponseError(
            `Avatar upload failed: ${uploadError.message}`,
            400,
          );
        }
      }

      const player = await this.playerModel.create(playerData);
      return ApiResponseSuccess('Player created successfully', player);
    } catch (error) {
      throw error;
    }
  }

  async findAll(
    player_type: string = 'MAN',
    position?: string,
    nationality?: string,
  ): Promise<BaseResponse<Omit<Player, 'createdAt' | 'updatedAt'>[]>> {
    const query: any = {};

    if (position) {
      query.position = position;
    }

    if (nationality) {
      query.nationality = new RegExp(nationality, 'i');
    }

    if (player_type) {
      query.player_type = player_type;
    }
    const players = await this.playerModel
      .find(query, { createdAt: 0, updatedAt: 0, __v: 0 })
      .sort({ position: 1 })
      .exec();
    return ApiResponseSuccess('Players found successfully', players);
  }

  async findOne(id: string): Promise<BaseResponse<Player>> {
    const player = await this.playerModel.findById(id).exec();
    if (!player) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }
    return ApiResponseSuccess('Player found successfully', player);
  }

  async findBySlug(slug: string): Promise<BaseResponse<Player>> {
    const player = await this.playerModel.findOne({ slug }).exec();
    if (!player) {
      throw new NotFoundException(`Player with slug ${slug} not found`);
    }
    return ApiResponseSuccess('Player found successfully', player);
  }

  async update(
    id: string,
    updatePlayerDto: UpdatePlayerDto,
  ): Promise<BaseResponse<Player>> {
    const existingPlayer = await this.playerModel
      .findByIdAndUpdate(id, updatePlayerDto, { new: true })
      .exec();

    if (!existingPlayer) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }

    return ApiResponseSuccess('Player updated successfully', existingPlayer);
  }

  async remove(id: string): Promise<BaseResponse<any>> {
    const deletedPlayer = await this.playerModel.findByIdAndDelete(id).exec();
    if (!deletedPlayer) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }
    return ApiResponseSuccess('Player deleted successfully', deletedPlayer);
  }

  async searchPlayers(query: string): Promise<BaseResponse<Player[]>> {
    const players = await this.playerModel
      .find({
        $or: [
          { fullName: new RegExp(query, 'i') },
          { nationality: new RegExp(query, 'i') },
          { position: new RegExp(query, 'i') },
        ],
      })
      .limit(10)
      .exec();

    return ApiResponseSuccess('Players found successfully', players);
  }

  async getPlayersByPosition(): Promise<
    BaseResponse<{ position: string; count: number }[]>
  > {
    const players = await this.playerModel.aggregate([
      {
        $group: {
          _id: '$position',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          position: '$_id',
          count: 1,
          _id: 0,
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    return ApiResponseSuccess('Players found successfully', players);
  }
}
