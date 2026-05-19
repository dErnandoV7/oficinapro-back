import { CreateClientSchemaType, EditClientSchemaType, ListClientsQuerySchemaType } from "../../common/schemas/client.schemas"
import { BadRequest, NotFoundError } from "../../common/utils/error"
import { AdminRepository } from "../admin/admin.repository"
import { ClientRepository } from "./client.repository"

export const ClientService = {
    async create(data: CreateClientSchemaType, adminId: string, storeId: string) {
        const user = await AdminRepository.findById(adminId)

        if (!storeId) {
            throw new BadRequest("Loja do usuário não encontrada no token.")
        }

        if (!user || user.store?.id !== storeId) {
            throw new NotFoundError("Não foi possível criar o cliente. O usuário admin não existe ou não está vinculado à loja.")
        }

        return await ClientRepository.create({ ...data, storeId })
    },

    async edit(data: EditClientSchemaType, clientId: string, storeId: string) {
        if (!storeId) {
            throw new BadRequest("Loja do usuário não encontrada no token.")
        }

        const client = await ClientRepository.findWithStore(clientId, storeId)

        if (!client) {
            throw new BadRequest("O cliente não existe.")
        }

        return await ClientRepository.edit(data, clientId)
    },

    async delete(clientId: string, storeId: string) {
        if (!storeId) {
            throw new BadRequest("Loja do usuário não encontrada no token.")
        }

        const client = await ClientRepository.findWithStore(clientId, storeId)

        if (!client) {
            throw new BadRequest("O cliente não existe.")
        }

        return await ClientRepository.delete(clientId)
    },

    async list(filters: ListClientsQuerySchemaType, storeId: string) {
        if (!storeId) {
            throw new BadRequest("Loja do usuário não encontrada no token.")
        }

        return await ClientRepository.list({
            storeId,
            q: filters.q,
            isActive: filters.isActive,
            sortBy: filters.sortBy,
            order: filters.order,
        })
    },

    async getById(clientId: string, storeId: string) {
        if (!storeId) {
            throw new BadRequest("Loja do usuário não encontrada no token.")
        }

        const client = await ClientRepository.findWithStore(clientId, storeId)

        if (!client) {
            throw new NotFoundError("O cliente não existe.")
        }

        return client
    },

    async profile(clientId: string, storeId: string) {
        if (!storeId) {
            throw new BadRequest("Loja do usuário não encontrada no token.")
        }

        const client = await ClientRepository.findWithStore(clientId, storeId)

        if (!client) {
            throw new NotFoundError("O cliente não existe.")
        }

        const debtSummary = await ClientRepository.getDebtSummary(clientId, storeId)

        return {
            client,
            debtSummary,
        }
    }
}