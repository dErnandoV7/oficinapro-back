import { NextFunction, Request, Response } from "express"
import { BadRequest } from "../../common/utils/error"
import { CreateSaleTypes, GetSaleTypes, ListSalesTypes } from "../../common/schemas/sale.schemas"
import { SaleService } from "./sale.service"

export const SaleController = {
    async create(req: Request, res: Response, next: NextFunction) {
        const storeId = res.locals.storeId

        try {
            if (!storeId) throw new BadRequest("Token inválido ou ausente.")

            const data = req.body as CreateSaleTypes
            const sale = await SaleService.create(data, storeId)

            return res.status(201).json({
                message: "Venda registrada com sucesso.",
                data: sale,
            })
        } catch (error) {
            next(error)
        }
    },

    async list(req: Request, res: Response, next: NextFunction) {
        const storeId = res.locals.storeId

        try {
            if (!storeId) throw new BadRequest("Token inválido ou ausente.")

            const filters = req.query as ListSalesTypes
            const sales = await SaleService.list(filters, storeId)

            return res.status(200).json({
                message: "Vendas buscadas com sucesso.",
                data: sales,
            })
        } catch (error) {
            next(error)
        }
    },

    async getById(req: Request, res: Response, next: NextFunction) {
        const storeId = res.locals.storeId

        try {
            if (!storeId) throw new BadRequest("Token inválido ou ausente.")

            const { saleId } = req.params as GetSaleTypes
            const sale = await SaleService.getById(saleId, storeId)

            return res.status(200).json({
                message: "Venda buscada com sucesso.",
                data: sale,
            })
        } catch (error) {
            next(error)
        }
    },
}
