import { Prisma } from "@prisma/client"

import { prisma } from "../../config/database"
import { ListSalesTypes } from "../../common/schemas/sale.schemas"

const buildOrderBy = (sortBy?: string, order?: "asc" | "desc"): Prisma.SaleOrderByWithRelationInput | Prisma.SaleOrderByWithRelationInput[] => {
    const direction = order ?? "desc"

    switch (sortBy) {
        case "totalAmount":
            return { totalAmount: direction }
        case "status":
            return [{ isFullyPaid: direction }, { amountPaid: direction }]
        case "customName":
            return { customName: direction }
        case "client":
            return { client: { name: direction } }
        default:
            return { createdAt: direction }
    }
}

type CreateSaleData = {
    storeId: string
    clientId?: string
    customName?: string
    description?: string
    totalAmount: number
    items: Array<{
        catalogItemId?: string
        customDesc?: string
        quantity: number
        unitPrice: number
        totalPrice: number
    }>
}

export const SaleRepository = {
    async create(data: CreateSaleData) {
        return prisma.$transaction(async (tx) => {
            const sale = await tx.sale.create({
                data: {
                    storeId: data.storeId,
                    clientId: data.clientId,
                    customName: data.customName,
                    description: data.description,
                    totalAmount: data.totalAmount,
                    items: {
                        create: data.items.map((item) => ({
                            catalogItemId: item.catalogItemId,
                            customDesc: item.customDesc,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            totalPrice: item.totalPrice,
                        })),
                    },
                },
                include: {
                    items: true,
                    client: { select: { id: true, name: true } },
                },
            })

            for (const item of data.items) {
                if (!item.catalogItemId) continue

                const catalogItem = await tx.catalogItem.findUnique({
                    where: { id: item.catalogItemId },
                    select: { type: true },
                })

                if (catalogItem?.type === "PRODUCT") {
                    await tx.catalogItem.update({
                        where: { id: item.catalogItemId },
                        data: { stock: { decrement: item.quantity } },
                    })
                    await tx.stockMovement.create({
                        data: {
                            catalogItemId: item.catalogItemId,
                            type: "OUT",
                            quantity: item.quantity,
                            reason: `Venda #${sale.id}`,
                        },
                    })
                }
            }

            return sale
        })
    },

    async list(storeId: string, filters: ListSalesTypes) {
        const paymentFilter =
            filters.paymentStatus === "pago" ? { isFullyPaid: true } :
            filters.paymentStatus === "parcial" ? { isFullyPaid: false, amountPaid: { gt: 0 } } :
            filters.paymentStatus === "pendente" ? { isFullyPaid: false, amountPaid: 0 } :
            {}

        return prisma.sale.findMany({
            where: {
                storeId,
                ...(filters.clientId ? { clientId: filters.clientId } : {}),
                ...paymentFilter,
            },
            select: {
                id: true,
                clientId: true,
                customName: true,
                description: true,
                totalAmount: true,
                amountPaid: true,
                isFullyPaid: true,
                createdAt: true,
                client: { select: { id: true, name: true, phone: true } },
                _count: { select: { items: true } },
            },
            orderBy: buildOrderBy(filters.sortBy, filters.order),
        })
    },

    async findById(saleId: string, storeId: string) {
        return prisma.sale.findFirst({
            where: { id: saleId, storeId },
            include: {
                client: { select: { id: true, name: true, phone: true } },
                items: {
                    include: {
                        item: { select: { id: true, name: true, type: true } },
                    },
                },
                payments: true,
            },
        })
    },
}
