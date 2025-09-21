import { Injectable, UnauthorizedException, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './users.entity';

export interface JwtPayload {
  sub: number;
  username: string;
  iat?: number;
  exp?: number;
}

export interface AuthResult {
  access_token: string;
  user: { id: number; username: string };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  private generateSixDigitPassword(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createUser(username: string, password: string): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { username } });
    if (existing) throw new ConflictException('Пользователь с таким именем уже существует');

    const newUser = this.userRepository.create({ username, oneTimeCode: password });
    return this.userRepository.save(newUser);
  }

  async validateUser(username: string, oneTimeCode: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username, oneTimeCode } });
  }

  async login(username: string, oneTimeCode: string): Promise<AuthResult> {
    const user = await this.validateUser(username, oneTimeCode);
    if (!user) throw new UnauthorizedException('Неверные учетные данные');

    const payload: JwtPayload = { username: user.username, sub: user.id };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });

    return { access_token: token, user: { id: user.id, username: user.username } };
  }

  async generatePasswordForUser(username: string): Promise<{ username: string; password: string }> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) throw new HttpException(`Пользователь ${username} не найден`, HttpStatus.NOT_FOUND);

    const password = this.generateSixDigitPassword();
    await this.userRepository.update(user.id, { oneTimeCode: password });

    return { username, password };
  }

  async getUserInfo(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }
}
