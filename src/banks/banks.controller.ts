// banks/banks.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BanksService } from './banks.service'; 
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { BankResponseDto } from './dto/bank-response.dto';
import { BankStatsResponseDto } from './dto/bank-stats-response.dto'; 

@ApiTags('banks')
@ApiBearerAuth()
@Controller('/banks')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class BanksController {
  private readonly logger = new Logger(BanksController.name);

  constructor(private readonly banksService: BanksService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все банки пользователя' })
  @ApiResponse({ 
    status: 200, 
    description: 'Список банков успешно получен',
    type: [BankResponseDto]
  })
  async findAll(@Request() req): Promise<BankResponseDto[]> {
    const userId = req.user.userId;
    this.logger.log(`GET /api/banks - User: ${userId}`);
    return this.banksService.findAllByUser(userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Получить статистику банков пользователя' })
  @ApiResponse({ 
    status: 200, 
    description: 'Статистика банков успешно получена',
    type: BankStatsResponseDto
  })
  async getStats(@Request() req): Promise<BankStatsResponseDto> {
    const userId = req.user.userId;
    this.logger.log(`GET /api/banks/stats - User: ${userId}`);
    return this.banksService.getStatsByUser(userId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Получить только активные банки пользователя' })
  @ApiResponse({ 
    status: 200, 
    description: 'Активные банки успешно получены',
    type: [BankResponseDto]
  })
  async findActive(@Request() req): Promise<BankResponseDto[]> {
    const userId = req.user.userId;
    this.logger.log(`GET /api/banks/active - User: ${userId}`);
    return this.banksService.findActiveByUser(userId);
  }

  @Get('inactive')
  @ApiOperation({ summary: 'Получить только неактивные банки пользователя' })
  @ApiResponse({ 
    status: 200, 
    description: 'Неактивные банки успешно получены',
    type: [BankResponseDto]
  })
  async findInactive(@Request() req): Promise<BankResponseDto[]> {
    const userId = req.user.userId;
    this.logger.log(`GET /api/banks/inactive - User: ${userId}`);
    return this.banksService.findInactiveByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить конкретный банк пользователя' })
  @ApiResponse({ 
    status: 200, 
    description: 'Банк успешно найден',
    type: BankResponseDto
  })
  @ApiResponse({ status: 404, description: 'Банк не найден' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<BankResponseDto> {
    const userId = req.user.userId;
    this.logger.log(`GET /api/banks/${id} - User: ${userId}`);
    return this.banksService.findOne(id, userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать новый банк' })
  @ApiResponse({ 
    status: 201, 
    description: 'Банк успешно создан',
    type: BankResponseDto
  })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @ApiResponse({ status: 409, description: 'Банк с таким телефоном уже существует' })
  async create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) 
    createBankDto: CreateBankDto,
    @Request() req,
  ): Promise<BankResponseDto> {
    const userId = req.user.userId;
    this.logger.log(`POST /api/banks - User: ${userId}, Bank: ${createBankDto.bank}`);
    return this.banksService.create(createBankDto, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить банк' })
  @ApiResponse({ 
    status: 200, 
    description: 'Банк успешно обновлен',
    type: BankResponseDto
  })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @ApiResponse({ status: 404, description: 'Банк не найден' })
  @ApiResponse({ status: 409, description: 'Банк с таким телефоном уже существует' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) 
    updateBankDto: UpdateBankDto,
    @Request() req,
  ): Promise<BankResponseDto> {
    const userId = req.user.userId;
    this.logger.log(`PATCH /api/banks/${id} - User: ${userId}`);
    return this.banksService.update(id, updateBankDto, userId);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Переключить статус банка' })
  @ApiResponse({ 
    status: 200, 
    description: 'Статус банка успешно изменен',
    type: BankResponseDto
  })
  @ApiResponse({ status: 404, description: 'Банк не найден' })
  async toggleStatus(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<BankResponseDto> {
    const userId = req.user.userId;
    this.logger.log(`PATCH /api/banks/${id}/toggle-status - User: ${userId}`);
    return this.banksService.toggleStatus(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить банк' })
  @ApiResponse({ status: 204, description: 'Банк успешно удален' })
  @ApiResponse({ status: 404, description: 'Банк не найден' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<void> {
    const userId = req.user.userId;
    this.logger.log(`DELETE /api/banks/${id} - User: ${userId}`);
    await this.banksService.remove(id, userId);
  }
}