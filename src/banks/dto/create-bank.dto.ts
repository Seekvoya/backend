import { IsString, IsOptional, IsEnum, Length, Matches, IsNotEmpty } from 'class-validator';


export class CreateBankDto {
  @IsString({ message: 'Название банка должно быть строкой' })
  @IsNotEmpty({ message: 'Название банка обязательно' })
  @Length(1, 255, { message: 'Название банка должно быть от 1 до 255 символов' })
  bank: string;

  @IsString({ message: 'Телефон должен быть строкой' })
  @IsNotEmpty({ message: 'Телефон обязателен' })
  @Length(1, 20, { message: 'Телефон должен быть от 1 до 20 символов' })
  @Matches(/^[+]?[\d\s\-\(\)]+$/, { message: 'Неверный формат телефона' })
  phone: string;

  @IsString({ message: 'ФИО держателя должно быть строкой' })
  @IsNotEmpty({ message: 'ФИО держателя обязательно' })
  @Length(1, 255, { message: 'ФИО держателя должно быть от 1 до 255 символов' })
  holder: string;

  @IsOptional()
  @IsString({ message: 'Комментарий должен быть строкой' })
  @Length(0, 1000, { message: 'Комментарий не может быть длиннее 1000 символов' })
  comment?: string;
}