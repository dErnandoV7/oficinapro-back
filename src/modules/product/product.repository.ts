import { CreateProductServiceTypes, EditProductServiceTypes, ListProductServiceTypes } from "../../common/schemas/product.schemas"
import { prisma } from "../../config/database"

export const ProductServiceRepository = {
    async create(data: CreateProductServiceTypes, storeId: string) {
        return prisma.catalogItem.create({
            data: { ...data, storeId }
        })
    },

    async edit(data: EditProductServiceTypes, productId: string) {
        return prisma.catalogItem.update({
            where: { id: productId },
            data
        })
    },

    async delete(productId: string) {
        return prisma.catalogItem.delete({
            where: { id: productId }
        })
    },

    async findById(productId: string, storeId: string) {
        const item = await prisma.catalogItem.findFirst({
            where: { id: productId, storeId }
        })
        if (!item) return null
        return { ...item, costPrice: Number(item.costPrice), sellPrice: Number(item.sellPrice) }
    },

    async restock(productId: string, quantity: number, reason?: string) {
        return prisma.$transaction(async (tx) => {
            const updated = await tx.catalogItem.update({
                where: { id: productId },
                data: { stock: quantity }
            })

            await tx.stockMovement.create({
                data: {
                    catalogItemId: productId,
                    type: "ADJUSTMENT",
                    quantity,
                    reason: reason ?? "Ajuste de estoque"
                }
            })

            return { ...updated, costPrice: Number(updated.costPrice), sellPrice: Number(updated.sellPrice) }
        })
    },

    async list({ order, search, type, isActive, sortBy }: ListProductServiceTypes, storeId: string) {
        const items = await prisma.catalogItem.findMany({
            where: {
                storeId,
                ...(type ? { type } : {}),
                ...(isActive !== undefined ? { isActive: isActive === "true" } : {}),
                ...(search ? {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { category: { contains: search, mode: "insensitive" } },
                    ]
                } : {})
            },

            orderBy: sortBy ? { [sortBy]: order ?? "asc" } : undefined,

            select: {
                id: true,
                name: true,
                type: true,
                category: true,
                description: true,
                costPrice: true,
                sellPrice: true,
                stock: true,
                minStock: true,
                isActive: true,
            }
        })

        return items.map(item => ({ ...item, costPrice: Number(item.costPrice), sellPrice: Number(item.sellPrice) }))
    }
}
