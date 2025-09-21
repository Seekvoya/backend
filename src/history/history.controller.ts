import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { HistoryService } from './history.service';
import { OperationDto } from './dto/operation.dto';

@Controller()
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post('/history/operation')
  async processOperation(@Body() dto: OperationDto & { username: string }) {
    const { username, ...operationData } = dto;
    return this.historyService.processOperation(username, operationData);
  }

  @Get('api/history')
  async getHistory(
    @Query('username') username: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 7
  ) {
    const result = await this.historyService.getHistory(username, page, limit);
    return {
      data: result.data,
      total: result.total,
      page,
      limit
    };
  }

  @Get('api/history/check/:username')
  async checkUser(@Param('username') username: string) {
    return this.historyService.getUserData(username);
  }
}