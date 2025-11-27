import { HttpException } from './httpException.js';

export class BadRequestException extends HttpException {
  constructor(description = 'BAD_REQUEST', errors = []) {
    super(description, 400);
    this.errors = errors;
  }
}
