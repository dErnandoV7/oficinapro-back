import { Prisma } from "@prisma/client"

import { BadRequest, NotFoundError } from "../../common/utils/error"
import { CreatePaymentTypes, ListPaymentsTypes } from "../../common/schemas/payment.schemas"
import { PaymentRepository } from "./payment.repository"

export const PaymentService = {
    async create(data: CreatePaymentTypes, storeId: string) {
        const sale = await PaymentRepository.findSaleWithStore(data.saleId, storeId)
        if (!sale) throw new NotFoundError("Comanda não encontrada.")
        if (sale.isFullyPaid) throw new BadRequest("Esta comanda já está totalmente paga.")

        const remaining = sale.totalAmount.minus(sale.amountPaid)
        if (new Prisma.Decimal(data.amount).greaterThan(remaining)) {
            throw new BadRequest(`O valor do pagamento não pode ser maior que o saldo devedor da comanda (R$ ${remaining.toFixed(2)}).`)
        }

        return PaymentRepository.create(data.saleId, data.amount)
    },

    async list(filters: ListPaymentsTypes, storeId: string) {
        return PaymentRepository.list(storeId, filters)
    },
}
