import { Request, Response, NextFunction } from "express"
import { CreateClientSchemaType, DeleteClientSchemaType, EditClientParamsSchemaType, EditClientSchemaType } from "../../common/schemas/client.schemas"
import { BadRequest } from "../../common/utils/error"
import { ClientService } from "./client.service"

export const ClientController = {
    async create(req: Request, res: Response, next: NextFunction) {
        const adminId = res.locals.userId
        const storeId = res.locals.storeId

        try {
            if (!adminId || !storeId) {
                throw new BadRequest("Token inválido ou ausente.")
            }

            const data = req.body as CreateClientSchemaType
            const client = await ClientService.create(data, adminId, storeId)

            return res.status(201).json({
                message: "Cliente criado com sucesso!",
                data: client
            })
        } catch (error) {
            next(error)
        }
    },

    async edit(req: Request, res: Response, next: NextFunction) {
        const storeId = res.locals.storeId

        try {
            if (!storeId) {
                throw new BadRequest("Token inválido ou ausente.")
            }

            const data = req.body as EditClientSchemaType
            const { clientId } = req.params as EditClientParamsSchemaType

            const client = await ClientService.edit(data, clientId, storeId)

            return res.status(200).json({
                message: "Cliente atualizado com sucesso!",
                data: client
            })
        } catch (error) {
            next(error)
        }
    },

    async delete(req: Request, res: Response, next: NextFunction) {
        const storeId = res.locals.storeId

        try {
            if (!storeId) {
                throw new BadRequest("Token inválido ou ausente.")
            }

            const { clientId } = req.params as DeleteClientSchemaType

            const client = await ClientService.delete(clientId, storeId)

            return res.status(200).json({
                message: "Cliente removido com sucesso!",
                data: client
            })
        } catch (error) {
            next(error)
        }
    }
}