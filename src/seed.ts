import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module'
import { AuthService } from './auth/auth.service'; 

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  // Тестовые пользователи
  const testUsers = [
    {
      username: 'Мамонт',
      oneTimeCode: '123456'
    },
    {
      username: 'admin',
      oneTimeCode: '654321'
    },
    {
      username: 'testuser',
      oneTimeCode: '111111'
    }
  ];

  console.log('Начинаем загрузку тестовых пользователей...');

  for (const userData of testUsers) {
    try {
      await authService.createUser(userData.username, userData.oneTimeCode);
      console.log(`✓ Пользователь ${userData.username} создан с кодом ${userData.oneTimeCode}`);
    } catch (error) {
      console.log(`✗ Пользователь ${userData.username} уже существует или произошла ошибка`);
    }
  }

  console.log('Загрузка завершена!');
  console.log('\nТестовые данные для входа:');
  console.log('Username: Мамонт, Code: 123456');
  console.log('Username: admin, Code: 654321');
  console.log('Username: testuser, Code: 111111');

  await app.close();
}

bootstrap();

// Для запуска: npm run seed