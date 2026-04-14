import { Request, Response, NextFunction } from "express";
import { NotFoundError, BadRequest } from "../utils/error";
import { authUtil } from "../utils/jwt";

declare global {
    namespace Express {
        interface Response {
            locals: {
                userId?: string; 
                storeId?: string; 
            };
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next(new NotFoundError("Token de autenticação não fornecido."));
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return next(new BadRequest("Formato de token inválido. Use 'Bearer <token>'."));
    }

    try {
        const payload = authUtil.verifyToken(token);
        res.locals.userId = payload.adminId;
        res.locals.storeId = payload.storeId;

        next();
    } catch (error) {
        next(error);
    }
}