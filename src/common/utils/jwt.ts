import jwt from "jsonwebtoken"
import { BadRequest } from "./error";

const SECRET_KEY = process.env.JWT_SECRET || process.env.SECRET_KEY || "chave_secreta"

export interface TokenPayload {
    adminId: string;
    storeId?: string;
    email: string;
}

export const authUtil = {
    verifyToken(token: string): TokenPayload {
        try {
            const payload = jwt.verify(token, SECRET_KEY)
            return payload as TokenPayload
        } catch (error) {
            throw new BadRequest("Token de autenticação inválido ou expirado.")
        }
    },

    generateToken(payload: TokenPayload): string {
        return jwt.sign(payload, SECRET_KEY, {
            expiresIn: "7d"
        })
    }
}