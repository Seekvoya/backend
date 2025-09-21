export class BankResponseDto {
  id: number;
  bank: string;
  phone: string;
  holder: string;
  comment?: string;
  status: 'Активный' | 'Неактивный';
  createdAt: Date;
  updatedAt: Date;
  userId: number;
}