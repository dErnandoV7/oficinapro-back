import { Prisma } from "@prisma/client"

import { prisma } from "../../config/database"
import { CreateClientSchemaType, EditClientSchemaType } from "../../common/schemas/client.schemas"

type ListClientsFilters = {
    storeId: string
    q?: string
}

export const ClientRepository = {
    async create(data: CreateClientSchemaType & { storeId: string }) {
        return prisma.client.create({ data })
    },

    async findById(id: string) {
        return prisma.client.findUnique({ where: { id } })
    },

    async list({ storeId, q }: ListClientsFilters) {
        return prisma.client.findMany({
            where: {
                storeId,
                ...(q
                    ? {
                        OR: [
                            { name: { contains: q, mode: "insensitive" } },
                            { phone: { contains: q } },
                        ],
                    }
                    : {}),
            },
            orderBy: {
                name: "asc",
            },
        })
    },

    async edit(data: EditClientSchemaType, id: string) {
        return prisma.client.update(
            {
                where: { id },
                data
            }
        )
    },

    async findWithStore(clientId: string, storeId: string) {
        return prisma.client.findFirst({
            where: {
                id: clientId, storeId
            }
        })
    },

    async getDebtSummary(clientId: string, storeId: string) {
        const [agg, openSalesCount] = await prisma.$transaction([
            prisma.sale.aggregate({
                where: {
                    clientId,
                    storeId,
                },
                _sum: {
                    totalAmount: true,
                    amountPaid: true,
                },
                _count: {
                    _all: true,
                },
            }),
            prisma.sale.count({
                where: {
                    clientId,
                    storeId,
                    isFullyPaid: false,
                },
            }),
        ])

        const zero = new Prisma.Decimal(0)
        const totalAmount = agg._sum.totalAmount ?? zero
        const amountPaid = agg._sum.amountPaid ?? zero

        return {
            totalSalesCount: agg._count._all,
            openSalesCount,
            totalAmount,
            amountPaid,
            outstanding: totalAmount.minus(amountPaid),
        }
    },

    async delete(id: string) {
        return prisma.client.delete({
            where: { id }
        })
    }
}