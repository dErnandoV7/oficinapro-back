import { BadRequest, NotFoundError } from "../../common/utils/error"
import { CreateSaleTypes, ListSalesTypes } from "../../common/schemas/sale.schemas"
import { ClientRepository } from "../client/client.repository"
import { ProductServiceRepository } from "../product/product.repository"
import { SaleRepository } from "./sale.repository"

export const SaleService = {
    async create(data: CreateSaleTypes, storeId: string) {
        if (data.clientId) {
            const client = await ClientRepository.findWithStore(data.clientId, storeId)
            if (!client) throw new NotFoundError("Cliente não encontrado.")
            if (!client.isActive) throw new BadRequest("Não é possível abrir venda para um cliente inativo.")
        }

        const resolvedItems = await Promise.all(
            data.items.map(async (item) => {
                if (item.catalogItemId) {
                    const catalogItem = await ProductServiceRepository.findById(item.catalogItemId, storeId)
                    if (!catalogItem) throw new NotFoundError(`Produto/serviço não encontrado: ${item.catalogItemId}`)
                    if (!catalogItem.isActive) throw new BadRequest(`O item "${catalogItem.name}" está inativo.`)

                    if (catalogItem.type === "PRODUCT" && catalogItem.stock < item.quantity) {
                        throw new BadRequest(
                            `Estoque insuficiente para "${catalogItem.name}". Disponível: ${catalogItem.stock}, solicitado: ${item.quantity}.`
                        )
                    }

                    const unitPrice = item.unitPrice ?? catalogItem.sellPrice
                    return {
                        catalogItemId: item.catalogItemId,
                        quantity: item.quantity,
                        unitPrice,
                        totalPrice: unitPrice * item.quantity,
                    }
                }

                const unitPrice = item.unitPrice!
                return {
                    customDesc: item.customDesc,
                    quantity: item.quantity,
                    unitPrice,
                    totalPrice: unitPrice * item.quantity,
                }
            })
        )

        const totalAmount = resolvedItems.reduce((sum, item) => sum + item.totalPrice, 0)

        return SaleRepository.create({
            storeId,
            clientId: data.clientId,
            customName: data.customName,
            description: data.description,
            totalAmount,
            items: resolvedItems,
        })
    },

    async list(filters: ListSalesTypes, storeId: string) {
        return SaleRepository.list(storeId, filters)
    },

    async getById(saleId: string, storeId: string) {
        const sale = await SaleRepository.findById(saleId, storeId)
        if (!sale) throw new NotFoundError("Venda não encontrada.")
        return sale
    },
}
