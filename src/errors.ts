export class InvalidLanguageError extends Error {
  constructor(msg?: string) {
    const message = msg || 'An invalid language was provided.';
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;

    Object.setPrototypeOf(this, InvalidLanguageError.prototype);
  }
}

export class NoSubtitleTracksError extends Error {
  constructor(msg?: string) {
    const message = msg || 'No subtitle tracks found in the video provided.';
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;

    Object.setPrototypeOf(this, NoSubtitleTracksError.prototype);
  }
}

export class UnsupportedFileTypeError extends Error {
  constructor(msg?: string) {
    const message = msg || 'Unsupported file type provided.';
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;

    Object.setPrototypeOf(this, UnsupportedFileTypeError.prototype);
  }
}
