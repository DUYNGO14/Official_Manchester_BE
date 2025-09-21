import { User, UserDocument } from '@/modules/users/schemas/user.schema';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashPassword } from '@/common/helper/password.util';
import {
  ApiResponseError,
  ApiResponsePaginateResponse,
  ApiResponseSuccess,
  BaseResponse,
  PaginatedData,
} from '@/common/helper/base_response';
import { RegisterUserDto } from '@/modules/auth/dto/create-auth.dto';
import { generateCode } from '@/common/helper/generator';
import dayjs from 'dayjs';
import { EmailService } from '@/modules/email/email.service';
import { UploadService } from '@/modules/upload/upload.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly emailService: EmailService,
    private readonly uploadService: UploadService,
  ) {}
  async create(
    createUserDto: CreateUserDto,
  ): Promise<BaseResponse<Omit<User, 'password'>>> {
    try {
      const hashedPassword = await hashPassword(createUserDto.password);
      const user = await this.userModel.create({
        ...createUserDto,
        password: hashedPassword,
      });

      // Loại bỏ password khi trả về
      const { password, ...result } = user.toObject();

      return ApiResponseSuccess('User created successfully', result, 201);
    } catch (error) {
      throw error;
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    search = '',
    sort: 'asc' | 'desc' = 'asc',
    order = 'createdAt',
  ): Promise<BaseResponse<PaginatedData<Omit<User, 'password'>>>> {
    try {
      const skip = (page - 1) * limit;

      // Query tìm kiếm
      const query: Record<string, any> = {};
      if (search) {
        query.$or = [
          { fullname: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      // Sort
      const sortOption: Record<string, 1 | -1> = {
        [order]: sort === 'asc' ? 1 : -1,
      };

      // Lấy dữ liệu & tổng số song song
      const [users, total] = await Promise.all([
        this.userModel
          .find(query, { password: 0 })
          .sort(sortOption)
          .skip(skip)
          .limit(limit)
          .lean(),
        this.userModel.countDocuments(query),
      ]);

      return ApiResponsePaginateResponse(
        'Users fetched successfully',
        users,
        page,
        limit,
        total,
      );
    } catch (error) {
      return ApiResponseError(
        error.message || 'Failed to fetch users',
        400,
        error,
      );
    }
  }

  async findOne(id: string): Promise<BaseResponse<Omit<User, 'password'>>> {
    try {
      const objectId = id?.toString().trim();

      if (!mongoose.Types.ObjectId.isValid(objectId)) {
        return ApiResponseError('Invalid id', 400);
      }

      const user = await this.userModel
        .findById(objectId, { password: 0, __v: 0 })
        .lean();

      if (!user) {
        return ApiResponseError('User not found', 404);
      }

      return ApiResponseSuccess('User fetched successfully', user, 200);
    } catch (error) {
      // có thể log error ra logger thay vì throw thẳng
      throw error;
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File,
  ): Promise<BaseResponse<Omit<User, 'password'>>> {
    let newAvatarPublicId: string | null = null;

    try {
      // ✅ SỬA LỖI: Kiểm tra ObjectId hợp lệ (điều kiện ngược lại)
      if (!Types.ObjectId.isValid(id)) {
        return ApiResponseError('Invalid user ID', 400);
      }

      const updateData: any = { ...updateUserDto };

      // Xử lý file upload nếu có
      if (file) {
        try {
          const upload = await this.uploadService.uploadSingleImage(file, {
            folder: 'user-avatars',
          });

          newAvatarPublicId = upload.publicId; // Lưu lại publicId mới để rollback nếu cần

          updateData.avatar = {
            url: upload.url,
            publicId: upload.publicId,
            format: upload.format,
            resourceType: upload.resourceType,
            width: upload.width,
            height: upload.height,
            bytes: upload.bytes,
            updatedAt: new Date(),
          };

          // Xóa avatar cũ trên Cloudinary nếu tồn tại
          const existingUser = await this.userModel
            .findById(id)
            .select('avatar')
            .lean();
          if (existingUser?.avatar?.publicId) {
            try {
              await this.uploadService.deleteFile(existingUser.avatar.publicId);
            } catch (deleteError) {
              console.warn('Failed to delete old avatar:', deleteError.message);
              // Không throw error vì đây chỉ là cleanup
            }
          }
        } catch (uploadError) {
          return ApiResponseError(
            `Avatar upload failed: ${uploadError.message}`,
            400,
          );
        }
      }

      // Cập nhật user trong database
      const user = await this.userModel
        .findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true,
          projection: { password: 0, __v: 0 },
        })
        .lean()
        .exec();

      // ✅ SỬA LỖI: Nếu không tìm thấy user, xóa avatar vừa upload
      if (!user) {
        if (newAvatarPublicId) {
          try {
            await this.uploadService.deleteFile(newAvatarPublicId);
          } catch (deleteError) {
            console.warn(
              'Failed to delete newly uploaded avatar:',
              deleteError.message,
            );
          }
        }
        return ApiResponseError('User not found', 404);
      }

      return ApiResponseSuccess('User updated successfully', user, 200);
    } catch (error) {
      // ✅ ROLLBACK: Nếu có lỗi và đã upload avatar mới, xóa avatar vừa upload
      if (newAvatarPublicId) {
        try {
          await this.uploadService.deleteFile(newAvatarPublicId);
        } catch (deleteError) {
          console.warn(
            'Failed to rollback avatar upload:',
            deleteError.message,
          );
        }
      }

      console.error('Update user error:', error);

      // Xử lý các loại lỗi cụ thể
      if (error.code === 11000) {
        return ApiResponseError('Email already exists', 400);
      }

      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(
          (err: any) => err.message,
        );
        return ApiResponseError(`Validation failed: ${errors.join(', ')}`, 400);
      }

      if (error.name === 'CastError') {
        return ApiResponseError('Invalid data format', 400);
      }

      // Throw lỗi unexpected
      throw new BadRequestException(`Update failed: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      if (mongoose.Types.ObjectId.isValid(id)) {
        return ApiResponseError('Invalid id', 400);
      }
      const result = await this.userModel.findByIdAndDelete(id);
      if (!result) {
        return ApiResponseError('User not found', 404);
      }
      return ApiResponseSuccess('User deleted successfully', result, 200);
    } catch (error) {
      throw error;
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await this.userModel.findOne({ email }).lean();
      return user;
    } catch (error) {
      throw error; // để AllExceptionsFilter bắt lỗi
    }
  }

  async registerUser(
    registerDto: RegisterUserDto,
  ): Promise<BaseResponse<Omit<User, 'password'>>> {
    try {
      registerDto.password = await hashPassword(registerDto.password);
      const code = await generateCode(6);
      const expired_code = dayjs().add(5, 'minute').toDate();
      const user = await this.userModel.create({
        ...registerDto,
        code,
        expired_code,
      });
      //Queue job
      const emailQueue = await this.emailService.sendOtpEmail({
        email: registerDto.email,
        otp: code,
      });
      if (!emailQueue) {
        return ApiResponseError('Failed to send OTP email', 400);
      }
      return ApiResponseSuccess('User created successfully', user, 201);
    } catch (error) {
      throw error;
    }
  }

  async verifyAccount(
  email: string,
  code: string,
): Promise<BaseResponse<Omit<User, 'password'>>> {
  try {
    const user = await this.userModel.findOne({ email });
    console.log(user?.code);
    if (!user) {
      return ApiResponseError('User not found', 404);
    } else if (user.code !== code) {
      return ApiResponseError('Invalid code or email', 400);
    } else if (dayjs(user.expired_code).isBefore(dayjs())) {
      return ApiResponseError('Code expired or invalid', 400);
    } else {
      // Sử dụng updateOne với $unset
      await this.userModel.updateOne(
        { email },
        { 
          $set: { isActive: true },
          $unset: { code: "", expired_code: "" }
        }
      );
      
      return ApiResponseSuccess('User verified successfully', user, 200);
    }
  } catch (error) {
    throw error;
  }
}
}
