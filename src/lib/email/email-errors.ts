export class EmailServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'EmailServiceError';
  }
}

export class EmailValidationError extends EmailServiceError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'EmailValidationError';
  }
}

export class EmailDeliveryError extends EmailServiceError {
  constructor(message: string, public statusCode?: number) {
    super(message, 'DELIVERY_ERROR');
    this.name = 'EmailDeliveryError';
  }
}

export class EmailConfigurationError extends EmailServiceError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR');
    this.name = 'EmailConfigurationError';
  }
}
