import { HttpException, HttpStatus } from '@nestjs/common';

export class BankNotFoundException extends HttpException {
  constructor() {
    super('Банк не найден', HttpStatus.NOT_FOUND);
  }
}

export class BankAlreadyExistsException extends HttpException {
  constructor() {
    super('Банк с таким номером телефона уже существует', HttpStatus.CONFLICT);
  }
}

export class BankAccessDeniedException extends HttpException {
  constructor() {
    super('У вас нет доступа к этому банку', HttpStatus.FORBIDDEN);
  }
}