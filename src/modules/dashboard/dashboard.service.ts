import { Prisma } from "@prisma/client"
import { prisma } from "../../config/database"

type LowStockItem = {
    id: string
    name: string
    stock: number
    minStock: number
}

export const DashboardService = {
    async getSummary(storeId: string) {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

        const [openSalesAgg, receivedAgg, clientsWithDebt, openSalesCount, lowStockRaw] = await Promise.all([
            prisma.sale.aggregate({
                where: { storeId, isFullyPaid: false },
                _sum: { totalAmount: true, amountPaid: true }
            }),
            prisma.payment.aggregate({
                where: {
                    sale: { storeId },
                    createdAt: { gte: startOfMonth, lt: endOfMonth }
                },
                _sum: { amount: true }
            }),
            prisma.sale.groupBy({
                by: ["clientId"],
                where: { storeId, isFullyPaid: false, clientId: { not: null } }
            }),
            prisma.sale.count({
                where: { storeId, isFullyPaid: false }
            }),
            prisma.$queryRaw<LowStockItem[]>`
                SELECT id, name, stock, "minStock"
                FROM "CatalogItem"
                WHERE "storeId" = ${storeId}
                AND "isActive" = true
                AND type = 'PRODUCT'
                AND stock <= "minStock"
                ORDER BY stock ASC
                LIMIT 10
            `
        ])

        const zero = new Prisma.Decimal(0)
        const totalAmount = openSalesAgg._sum.totalAmount ?? zero
        const amountPaid = openSalesAgg._sum.amountPaid ?? zero

        return {
            totalReceivable: Number(totalAmount.minus(amountPaid)),
            totalReceivedThisMonth: Number(receivedAgg._sum.amount ?? zero),
            clientsWithDebt: clientsWithDebt.length,
            openSalesCount,
            lowStockItems: lowStockRaw.map(item => ({
                id: item.id,
                name: item.name,
                stock: Number(item.stock),
                minStock: Number(item.minStock),
            }))
        }
    }
}
