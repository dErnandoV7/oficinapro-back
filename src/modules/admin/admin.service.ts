import { CreateAdminSchemaType, LoginAdminSchemaType } from "../../common/schemas/admin.schemas"
import { BadRequest, ConflictError, NotFoundError } from "../../common/utils/error"
import { comparePassword } from "../../common/utils/hash"
import { authUtil } from "../../common/utils/jwt"
import { AdminRepository } from "./admin.repository"

export const AdminService = {
    async create(data: CreateAdminSchemaType) {
        const { email, name, password, phone } = data

        const existingAdmin = await AdminRepository.findByEmailOrPhone(email, phone)

        if (existingAdmin) {
            throw new ConflictError("Os dados informados já estão em uso no sistema.")
        }

        return await AdminRepository.create(data)
    },

    async login(data: LoginAdminSchemaType) {
        const { email, password } = data

        const user = await AdminRepository.findByEmailOrPhone(email)

        if (!user) {
            throw new BadRequest("Email ou senha incorretos.")
        }

        const validPassword = await comparePassword(password, user.password)

        if (!validPassword) {
            throw new BadRequest("Email ou senha incorretos.")
        }

        const token = authUtil.generateToken({
            adminId: user.id,
            email: user.email
        })

        return {
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                store: user.store
            },
            token
        }
    }
}