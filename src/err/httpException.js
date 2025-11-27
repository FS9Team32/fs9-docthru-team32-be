export class HttpException extends Error {
  statusCode;
  constructor(descriprion, statusCode) {
    super(descriprion);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}
