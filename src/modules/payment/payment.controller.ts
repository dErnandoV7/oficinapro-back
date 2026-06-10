import { NextFunction, Request, Response } from "express"
import { BadRequest } from "../../common/utils/error"
import { CreatePaymentTypes, ListPaymentsTypes } from "../../common/schemas/payment.schemas"
import { PaymentService } from "./payment.service"

export const PaymentController = {
    async create(req: Request, res: Response, next: NextFunction) {
        const storeId = res.locals.storeId

        try {
            if (!storeId) throw new BadRequest("Token inválido ou ausente.")

            const data = req.body as CreatePaymentTypes
            const payment = await PaymentService.create(data, storeId)

            return res.status(201).json({
                message: "Pagamento registrado com sucesso.",
                data: payment,
            })
        } catch (error) {
            next(error)
        }
    },

    async list(req: Request, res: Response, next: NextFunction) {
        const storeId = res.locals.storeId

        try {
            if (!storeId) throw new BadRequest("Token inválido ou ausente.")

            const filters = req.query as ListPaymentsTypes
            const payments = await PaymentService.list(filters, storeId)

            return res.status(200).json({
                message: "Pagamentos buscados com sucesso.",
                data: payments,
            })
        } catch (error) {
            next(error)
        }
    },
}
