import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/users.entity';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { BankResponseDto } from './dto/bank-response.dto';
import { BankStatsResponseDto } from './dto/bank-stats-response.dto';
import { BankNotFoundException, BankAccessDeniedException, BankAlreadyExistsException } from './exceptions/bank-exceptions';
import { Bank } from './entity/banks.entity';

@Injectable()
export class BanksService {
  private readonly logger = new Logger(BanksService.name);

  constructor(
    @InjectRepository(Bank)
    private banksRepository: Repository<Bank>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Получить все банки пользователя
  async findAllByUser(userId: number): Promise<BankResponseDto[]> {
    this.logger.log(`Fetching all banks for user ${userId}`);
    
    const banks = await this.banksRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return banks.map(bank => this.mapToResponseDto(bank));
  }

  // Получить банк по ID (с проверкой принадлежности пользователю)
  async findOne(id: number, userId: number): Promise<BankResponseDto> {
    this.logger.log(`Fetching bank ${id} for user ${userId}`);
    
    const bank = await this.banksRepository.findOne({
      where: { id, userId },
    });

    if (!bank) {
      throw new BankNotFoundException();
    }

    return this.mapToResponseDto(bank);
  }

  // Создать новый банк
  async create(createBankDto: CreateBankDto, userId: number): Promise<BankResponseDto> {
    this.logger.log(`Creating new bank for user ${userId}: ${createBankDto.bank}`);

    // Проверяем существование пользователя
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BankAccessDeniedException();
    }

    // Проверяем уникальность комбинации банк + телефон для пользователя
    const existingBank = await this.banksRepository.findOne({
      where: {
        bank: createBankDto.bank,
        phone: createBankDto.phone,
        userId,
      },
    });

    if (existingBank) {
      throw new BankAlreadyExistsException();
    }

    // Очищаем и нормализуем данные
    const normalizedPhone = this.normalizePhone(createBankDto.phone);
    const normalizedHolder = this.normalizeFullName(createBankDto.holder);

    const bank = this.banksRepository.create({
      bank: createBankDto.bank.trim(),
      phone: normalizedPhone,
      holder: normalizedHolder,
      comment: createBankDto.comment?.trim() || null,
      userId,
      status: 'Активный',
    });

    const savedBank = await this.banksRepository.save(bank);
    
    this.logger.log(`Bank created successfully with ID: ${savedBank.id}`);
    return this.mapToResponseDto(savedBank);
  }

  // Обновить банк
  async update(id: number, updateBankDto: UpdateBankDto, userId: number): Promise<BankResponseDto> {
    this.logger.log(`Updating bank ${id} for user ${userId}`);

    const bank = await this.banksRepository.findOne({ where: { id, userId } });
    if (!bank) {
      throw new BankNotFoundException();
    }

    // Если обновляются банк или телефон, проверяем уникальность
    if (updateBankDto.bank || updateBankDto.phone) {
      const bankName = updateBankDto.bank?.trim() || bank.bank;
      const phone = updateBankDto.phone ? this.normalizePhone(updateBankDto.phone) : bank.phone;

      const existingBank = await this.banksRepository.findOne({
        where: {
          bank: bankName,
          phone: phone,
          userId,
        },
      });

      if (existingBank && existingBank.id !== id) {
        throw new BankAlreadyExistsException();
      }
    }

    // Обновляем поля с нормализацией
    if (updateBankDto.bank) {
      bank.bank = updateBankDto.bank.trim();
    }
    if (updateBankDto.phone) {
      bank.phone = this.normalizePhone(updateBankDto.phone);
    }
    if (updateBankDto.holder) {
      bank.holder = this.normalizeFullName(updateBankDto.holder);
    }
    if (updateBankDto.comment !== undefined) {
      bank.comment = updateBankDto.comment?.trim() || null;
    }
    if (updateBankDto.status) {
      bank.status = updateBankDto.status;
    }

    const updatedBank = await this.banksRepository.save(bank);
    
    this.logger.log(`Bank ${id} updated successfully`);
    return this.mapToResponseDto(updatedBank);
  }

  // Переключить статус банка
  async toggleStatus(id: number, userId: number): Promise<BankResponseDto> {
    this.logger.log(`Toggling status for bank ${id} for user ${userId}`);

    const bank = await this.banksRepository.findOne({ where: { id, userId } });
    if (!bank) {
      throw new BankNotFoundException();
    }
    
    bank.status = bank.status === 'Активный' ? 'Неактивный' : 'Активный';
    
    const updatedBank = await this.banksRepository.save(bank);
    
    this.logger.log(`Bank ${id} status changed to ${bank.status}`);
    return this.mapToResponseDto(updatedBank);
  }

  // Удалить банк
  async remove(id: number, userId: number): Promise<void> {
    this.logger.log(`Deleting bank ${id} for user ${userId}`);

    const bank = await this.banksRepository.findOne({ where: { id, userId } });
    if (!bank) {
      throw new BankNotFoundException();
    }

    await this.banksRepository.remove(bank);
    this.logger.log(`Bank ${id} deleted successfully`);
  }

  // Получить статистику банков пользователя
  async getStatsByUser(userId: number): Promise<BankStatsResponseDto> {
    this.logger.log(`Fetching banks statistics for user ${userId}`);
    
    const [total, active] = await Promise.all([
      this.banksRepository.count({ where: { userId } }),
      this.banksRepository.count({ 
        where: { userId, status: 'Активный' } 
      }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
    };
  }

  // Получить активные банки пользователя
  async findActiveByUser(userId: number): Promise<BankResponseDto[]> {
    this.logger.log(`Fetching active banks for user ${userId}`);
    
    const banks = await this.banksRepository.find({
      where: { userId, status: 'Активный' },
      order: { createdAt: 'DESC' },
    });

    return banks.map(bank => this.mapToResponseDto(bank));
  }

  // Получить неактивные банки пользователя
  async findInactiveByUser(userId: number): Promise<BankResponseDto[]> {
    this.logger.log(`Fetching inactive banks for user ${userId}`);
    
    const banks = await this.banksRepository.find({
      where: { userId, status: 'Неактивный' },
      order: { createdAt: 'DESC' },
    });

    return banks.map(bank => this.mapToResponseDto(bank));
  }

  // Приватные методы для нормализации данных
  private normalizePhone(phone: string): string {
    return phone.replace(/\s+/g, ' ').trim();
  }

  private normalizeFullName(fullName: string): string {
    return fullName
      .split(' ')
      .filter(part => part.length > 0)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  private mapToResponseDto(bank: Bank): BankResponseDto {
    return {
      id: bank.id,
      bank: bank.bank,
      phone: bank.phone,
      holder: bank.holder,
      comment: bank.comment,
      status: bank.status,
      createdAt: bank.createdAt,
      updatedAt: bank.updatedAt,
      userId: bank.userId,
    };
  }
}