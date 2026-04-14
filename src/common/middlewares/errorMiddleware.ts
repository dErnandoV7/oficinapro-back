import { Request, Response, NextFunction } from "express";

interface HttpError extends Error {
    statusCode?: number;
}

export function errorHandler(err: HttpError, req: Request, res: Response, next: NextFunction) {

    console.error(err);

    const status = err.statusCode || 500;

    const message = err.statusCode
        ? err.message
        : 'Ocorreu um erro interno no servidor.';

    return res.status(status).json({
        error: err.name || 'InternalServerError',
        message: message,
    });
}