import { ZodError, ZodType } from "zod"
import { Request, Response, NextFunction } from "express"
import { BadRequest } from "../utils/error"

export const validate = (schema: ZodType) => (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        schema.parse({
            body: req.body,
            params: req.params,
            query: req.query
        })

        next()
    } catch (error) {
        if (error instanceof ZodError) {
            const message = error.issues.map((err: { message: string }) => err.message).join('; ');

            return next(new BadRequest(`Erro de validação: ${message}`));
        } else {
            return next(error);
        }
    }
}