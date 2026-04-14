import { prisma } from "../../config/database"
import { CreateClientSchemaType, EditClientSchemaType } from "../../common/schemas/client.schemas"

export const ClientRepository = {
    async create(data: CreateClientSchemaType & { storeId: string }) {
        return prisma.client.create({ data })
    },

    async findById(id: string) {
        return prisma.client.findUnique({ where: { id } })
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

    async delete(id: string) {
        return prisma.client.delete({
            where: { id }
        })
    }
}