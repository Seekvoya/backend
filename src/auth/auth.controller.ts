import { Controller, Post, Body, Get, Param, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('check/:username')
  async getUserInfo(@Param('username') username: string) {
    return this.authService.getUserInfo(username);
  }

  @Post('register')
  async register(@Body() body: { username: string; oneTimeCode: string }) {
    const newUser = await this.authService.createUser(body.username, body.oneTimeCode);
    return { message: 'Регистрация успешна', user: { id: newUser.id, username: newUser.username } };
  }

  @Post('login')
  async login(@Body() body: { username: string; oneTimeCode: string }) {
    return this.authService.login(body.username, body.oneTimeCode);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  @Post('generate-password')
  async generatePassword(@Body() body: { username: string }) {
    return this.authService.generatePasswordForUser(body.username);
  }

}
