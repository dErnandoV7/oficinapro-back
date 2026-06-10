import { prisma } from "../../config/database"
import { ListPaymentsTypes } from "../../common/schemas/payment.schemas"

const buildCreatedAtRange = (month?: number, year?: number) => {
    if (!month && !year) return undefined

    const targetYear = year ?? new Date().getFullYear()

    if (month) {
        return {
            gte: new Date(targetYear, month - 1, 1),
            lt: new Date(targetYear, month, 1),
        }
    }

    return {
        gte: new Date(targetYear, 0, 1),
        lt: new Date(targetYear + 1, 0, 1),
    }
}

export const PaymentRepository = {
    async findSaleWithStore(saleId: string, storeId: string) {
        return prisma.sale.findFirst({
            where: { id: saleId, storeId },
        })
    },

    async create(saleId: string, amount: number) {
        return prisma.$transaction(async (tx) => {
            const sale = await tx.sale.findUniqueOrThrow({ where: { id: saleId } })

            const newAmountPaid = sale.amountPaid.plus(amount)

            await tx.sale.update({
                where: { id: saleId },
                data: {
                    amountPaid: newAmountPaid,
                    isFullyPaid: newAmountPaid.greaterThanOrEqualTo(sale.totalAmount),
                },
            })

            return tx.payment.create({
                data: {
                    saleId,
                    clientId: sale.clientId,
                    amount,
                },
                include: {
                    client: { select: { id: true, name: true, phone: true } },
                    sale: {
                        select: {
                            id: true,
                            customName: true,
                            totalAmount: true,
                            amountPaid: true,
                            isFullyPaid: true,
                        },
                    },
                },
            })
        })
    },

    async list(storeId: string, filters: ListPaymentsTypes) {
        const createdAtRange = buildCreatedAtRange(filters.month, filters.year)

        return prisma.payment.findMany({
            where: {
                sale: { storeId },
                ...(filters.clientId ? { clientId: filters.clientId } : {}),
                ...(filters.saleId ? { saleId: filters.saleId } : {}),
                ...(createdAtRange ? { createdAt: createdAtRange } : {}),
            },
            include: {
                client: { select: { id: true, name: true, phone: true } },
                sale: {
                    select: {
                        id: true,
                        customName: true,
                        totalAmount: true,
                        client: { select: { id: true, name: true } },
                    },
                },
            },
            orderBy: filters.sortBy === "client"
                ? { client: { name: filters.order ?? "asc" } }
                : filters.sortBy
                    ? { [filters.sortBy]: filters.order ?? "desc" }
                    : { createdAt: "desc" },
        })
    },
}
