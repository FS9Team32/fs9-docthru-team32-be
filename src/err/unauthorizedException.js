import { HttpException } from './httpException.js';

export class UnauthorizedException extends HttpException {
  constructor(description = 'UNAUTHORIZED') {
    super(description, 401);
  }
}
