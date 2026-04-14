import { Request, Response, NextFunction } from "express"
import { CreateAdminSchemaType, LoginAdminSchemaType } from "../../common/schemas/admin.schemas"
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
    }
}