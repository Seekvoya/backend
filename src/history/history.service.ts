import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from './history.entity';
import { OperationType } from './operation-type.enum';
import { OperationDto } from './dto/operation.dto';
import { User } from 'src/auth/users.entity';

@Injectable()
export class HistoryService {
    constructor(
        @InjectRepository(History)
        private readonly historyRepository: Repository<History>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async processOperation(username: string, dto: OperationDto): Promise<{ balance: number; frozen: number }> {
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user) throw new Error('User not found');

        // Операция пополнения
        if (dto.balance) {
            user.balance = Number(user.balance) + Number(dto.balance);
            await this.userRepository.save(user);

            await this.createHistoryRecord(
                user.id,
                OperationType.REPLENISHMENT,
                dto.balance,
                user.balance,
                user.frozen
            );

            return { balance: user.balance, frozen: user.frozen };
        }

        // Операция списания
        if (dto.writeOff) {
            const writeOffAmount = Number(dto.writeOff);
            let newBalance = Number(user.balance);
            let newFrozen = Number(user.frozen);

            if (writeOffAmount <= newBalance) {
                newBalance = newBalance - writeOffAmount;
                // Заморожено остается 0
            } else {
                const difference = writeOffAmount - newBalance;
                newBalance = 0;
                newFrozen = difference; // Заморожено становится разницей
            }

            user.balance = newBalance;
            user.frozen = newFrozen;
            await this.userRepository.save(user);

            await this.createHistoryRecord(
                user.id,
                OperationType.WRITE_OFF,
                -writeOffAmount,
                user.balance,
                user.frozen
            );

            return { balance: user.balance, frozen: user.frozen };
        }

        // Операция заморозки (без записи в историю)
        if (dto.frozen !== undefined) {
            user.frozen = Number(dto.frozen);
            await this.userRepository.save(user);
            return { balance: user.balance, frozen: user.frozen };
        }

        return { balance: user.balance, frozen: user.frozen };
    }

    private async createHistoryRecord(
        userId: number,
        type: OperationType,
        amount: number,
        balance: number,
        frozen: number
    ): Promise<History> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new Error('User not found');

        const record = this.historyRepository.create({
            type,
            amount,
            balance,
            frozen,
            user
        });

        return this.historyRepository.save(record);
    }

    async getHistory(username: string, page: number = 1, limit: number = 7): Promise<{ data: History[]; total: number }> {
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user) throw new Error('User not found');

        const [data, total] = await this.historyRepository.findAndCount({
            where: { user: { id: user.id } },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            data: data || [],
            total: total || 0
        };
    }

    async getUserData(username: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user) throw new Error('User not found');
        return user;
    }
}