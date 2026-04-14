export class ConflictError extends Error {
    statusCode = 409

    constructor(message: string) {
        super(message);
        this.name = "ConflctError"
    }
}

export class NotFoundError extends Error {
    statusCode = 404

    constructor(message: string) {
        super(message);
        this.name = "NotFoundError"
    }
}

export class BadRequest extends Error {
    statusCode = 400

    constructor(message: string) {
        super(message);
        this.name = "BadRequest"
    }
}