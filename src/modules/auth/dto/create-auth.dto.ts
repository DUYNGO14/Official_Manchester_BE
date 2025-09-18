import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @Length(6, 30, { message: 'Mật khẩu phải từ 6 đến 30 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường và một số',
  })
  password: string;
}

export class RegisterUserDto {
  @IsOptional()
  @IsString({ message: 'Họ và tên phải là chuỗi ký tự' })
  fullname: string;

  @IsNotEmpty({ message: 'Email không được spep trONGL' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsNotEmpty({ message: 'Tên đăng nhập không được spep trONGL' })
  @IsString({ message: 'Tên đăng nhập phải là chuỗi ký tự' })
  @Length(3, 20, { message: 'Tên đăng nhập phải từ 3 đến 20 ký tự' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Tên đăng nhập chỉ có chữ cái, số và dấu gạch dưới',
  })
  username: string;

  @IsNotEmpty({ message: 'Mật hàng được spep trONGL' })
  @IsString({ message: 'Mật hàng phải là chuỗi ký tự' })
  @Length(6, 30, { message: 'Mật hàng phải từ 6 đến 30 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Mật hàng phải chứa ít nhất một chữ hoa, một chữ thường và một số',
  })
  password: string;
}