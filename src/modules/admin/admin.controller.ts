import { Request, Response, NextFunction } from "express"
import { CreateAdminSchemaType, CreateStoreSchemaType, LoginAdminSchemaType } from "../../common/schemas/admin.schemas"
import { BadRequest } from "../../common/utils/error"
import { AdminService } from "./admin.service"

export const AdminController = {
    async create(req: Request, res: Response, next: NextFunction) {

        try {
            const data = req.body as CreateAdminSchemaType
            const user = await AdminService.create(data)

            return res.status(201).json({
                message: "Conta criada com sucesso!",
                data: user
            })
        } catch (error) {
            next(error)
        }
    },

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body as LoginAdminSchemaType

            const user = await AdminService.login(data)

            return res.status(200).json({
                message: "Login realizado com sucesso!",
                data: user
            })
        } catch (error) {
            next(error)
        }
    },

    async createStore(req: Request, res: Response, next: NextFunction) {
        const adminId = res.locals.userId

        try {
            if (!adminId) {
                throw new BadRequest("Token inválido ou ausente.")
            }

            const data = req.body as CreateStoreSchemaType
            const result = await AdminService.createStore(data, adminId)

            return res.status(201).json({
                message: "Loja criada com sucesso!",
                data: result
            })
        } catch (error) {
            next(error)
        }
    }
}