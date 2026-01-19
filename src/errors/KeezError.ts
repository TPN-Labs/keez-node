/* eslint-disable max-classes-per-file */
export class KeezError extends Error {
    constructor(
        message: string,
        public readonly statusCode?: number,
        public readonly originalError?: unknown
    ) {
        super(message);
        this.name = 'KeezError';
    }
}

export class KeezAuthError extends KeezError {
    constructor(message: string, statusCode?: number, originalError?: unknown) {
        super(message, statusCode, originalError);
        this.name = 'KeezAuthError';
    }
}

export class KeezApiError extends KeezError {
    constructor(message: string, statusCode?: number, originalError?: unknown) {
        super(message, statusCode, originalError);
        this.name = 'KeezApiError';
    }
}
