import { IsOptional, IsNumber, IsPositive, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class OperationDto {
    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    balance?: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    writeOff?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    frozen?: number;

    @IsOptional()
    @IsString()
    username?: string;
}