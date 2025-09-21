import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Имя пользователя не может быть пустым' })
  @MinLength(3, { message: 'Имя пользователя должно содержать минимум 3 символа' })
  @MaxLength(50, { message: 'Имя пользователя не должно превышать 50 символов' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'Пароль не может быть пустым' })
  oneTimeCode: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Имя пользователя не может быть пустым' })
  @MinLength(3, { message: 'Имя пользователя должно содержать минимум 3 символа' })
  @MaxLength(50, { message: 'Имя пользователя не должно превышать 50 символов' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { 
    message: 'Имя пользователя может содержать только буквы, цифры, дефисы и подчеркивания' 
  })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'Пароль не может быть пустым' })
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  @MaxLength(100, { message: 'Пароль не должен превышать 100 символов' })
  oneTimeCode: string; // Используется как пароль
}

export class UserResponseDto {
  id: number;
  username: string;
  createdAt?: Date;
}

export class AuthResponseDto {
  message: string;
  user: UserResponseDto;
}