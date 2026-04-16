import { CreateAdminSchemaType, CreateStoreSchemaType, LoginAdminSchemaType } from "../../common/schemas/admin.schemas"
import { BadRequest, ConflictError, NotFoundError } from "../../common/utils/error"
import { comparePassword, hashPassword } from "../../common/utils/hash"
import { authUtil } from "../../common/utils/jwt"
import { AdminRepository } from "./admin.repository"

export const AdminService = {
    async create(data: CreateAdminSchemaType) {
        const { email, name, password, phone } = data

        const existingAdmin = await AdminRepository.findByEmailOrPhone(email, phone)

        if (existingAdmin) {
            throw new ConflictError("Os dados informados já estão em uso no sistema.")
        }

        const passwordHash = await hashPassword(password)

        return await AdminRepository.create({ ...data, password: passwordHash })
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
            storeId: user.store?.id || "",
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
    },

    async createStore(data: CreateStoreSchemaType, adminId: string) {
        const admin = await AdminRepository.findById(adminId)

        if (!admin) {
            throw new NotFoundError("Admin não encontrado.")
        }

        if (admin.store) {
            throw new ConflictError("Este admin já possui uma loja cadastrada.")
        }

        const store = await AdminRepository.createStore(admin.id, data.name)

        const token = authUtil.generateToken({
            adminId: admin.id,
            storeId: store.id,
            email: admin.email
        })

        return {
            store,
            token
        }
    }
}