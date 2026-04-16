import z from "zod"

export const CreateAdminSchema = z.object({
    body: z.object({
        name: z.string()
            .min(3, "O nome deve ter pelo menos 3 caracteres"),
        email: z.email(),
        phone: z.string()
            .min(10, "O número deve ter pelo menos 10 caracteres"),
        password: z.string()
            .min(8, "A senha deve ter pelo menos 8 caracteres")
    })
})

export const LoginAdminSchema = z.object({
    body: z.object({
        email: z.email(),
        password: z.string()
            .min(8, "A senha deve ter pelo menos 8 caracteres")
    })
})

export const CreateStoreSchema = z.object({
    body: z.object({
        name: z.string()
            .min(3, "O nome da loja deve ter pelo menos 3 caracteres")
    })
})

export type CreateAdminSchemaType = z.infer<typeof CreateAdminSchema>["body"]
export type LoginAdminSchemaType = z.infer<typeof LoginAdminSchema>["body"]
export type CreateStoreSchemaType = z.infer<typeof CreateStoreSchema>["body"]