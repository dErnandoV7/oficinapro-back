import { prisma } from "../../config/database"
import { CreateAdminSchemaType, LoginAdminSchemaType } from "../../common/schemas/admin.schemas"

export const AdminRepository = {
    async findByEmailOrPhone(email?: string, phone?: string) {
        if (!email && !phone) return null

        return prisma.admin.findFirst({
            where: {
                OR: [
                    { email },
                    { phone }
                ]
            },
            include: {
                store: true
            }
        })
    },

    async create(data: CreateAdminSchemaType) {
        return prisma.admin.create({ data })
    }
}