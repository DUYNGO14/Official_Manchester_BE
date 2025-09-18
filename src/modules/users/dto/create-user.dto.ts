import {
  IsEmail,
  IsNotEmpty,
  Length,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  IsString,
  Matches,
  IsEnum,
} from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsString({ message: 'Họ và tên phải là chuỗi ký tự' })
  @Length(2, 50, { message: 'Họ và tên phải từ 2 đến 50 ký tự' })
  fullname: string;

  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @IsString({ message: 'Tên đăng nhập phải là chuỗi ký tự' })
  @Length(3, 20, { message: 'Tên đăng nhập phải từ 3 đến 20 ký tự' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới',
  })
  username: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @Length(6, 30, { message: 'Mật khẩu phải từ 6 đến 30 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường và một số',
  })
  password: string;

  @IsOptional()
  @IsNumber({}, { message: 'Tuổi phải là số' })
  @Min(1, { message: 'Tuổi phải lớn hơn 0' })
  @Max(150, { message: 'Tuổi không hợp lệ' })
  age: number;

  @IsOptional()
  avatar: {
    url: string;
    publicId: string;
    format: string;
    resourceType: string;
  };

  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @Matches(/^[0-9+\-\s()]{10,15}$/, {
    message: 'Số điện thoại không hợp lệ',
  })
  phone_number: string;

  @IsOptional()
  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
  @Length(5, 200, { message: 'Địa chỉ phải từ 5 đến 200 ký tự' })
  address: string;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái kích hoạt phải là true hoặc false' })
  isActive: boolean;

  @IsOptional()
  @IsEnum(['LOCAL', 'GOOGLE', 'FACEBOOK'], {
    message: 'Loại tài khoản phải là LOCAL, GOOGLE hoặc FACEBOOK',
  })
  accountType: string;

  @IsOptional()
  @IsEnum(['MALE', 'FEMALE', 'OTHER'], {
    message: 'Giới tính phải là MALE, FEMALE hoặc OTHER',
  })
  gender: string;
}
