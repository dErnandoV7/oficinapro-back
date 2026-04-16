import z from "zod"

export const CreateClientSchema = z.object({
    body: z.object({
        name: z.string()
            .min(3, "O nome do cliente deve ter pelo menos 3 caracteres"),

        phone: z.string()
            .min(10, "O número do cliente deve ter pelo menos 10 caracteres")
            .optional(),

        address: z.string()
            .min(5, "O endereço do cliente deve ter pelo menos 5 caracteres"),

        creditLimit: z.number()
            .optional()
    })
})

export const EditClientSchema = z.object({
    params: z.object({
        clientId: z.string()
            .min(1, "O id do cliente é obrigatório")
    }),
    body: z.object({
        name: z.string()
            .min(3, "O nome do cliente deve ter pelo menos 3 caracteres")
            .optional(),

        phone: z.string()
            .min(10, "O número do cliente deve ter pelo menos 10 caracteres")
            .optional(),

        address: z.string()
            .min(5, "O endereço do cliente deve ter pelo menos 5 caracteres")
            .optional(),

        creditLimit: z.number()
            .optional(),

        isActive: z.boolean()
            .optional()
    })
}).refine(({ body }) => Object.values(body).some((value) => value !== undefined), {
    message: "Envie ao menos um campo para edição.",
    path: ["body"],
})


export const DeleteClientSchema = z.object({
    params: z.object({
        clientId: z.string()
            .min(1, "O id do cliente é obrigatório")
    }),
})


export const ListClientsSchema = z.object({
    query: z.object({
        q: z.string()
            .min(1, "A busca (q) não pode ser vazia")
            .optional(),
    })
})

export const GetClientSchema = z.object({
    params: z.object({
        clientId: z.string()
            .min(1, "O id do cliente é obrigatório")
    })
})

export const ClientProfileSchema = z.object({
    params: z.object({
        clientId: z.string()
            .min(1, "O id do cliente é obrigatório")
    })
})


export type CreateClientSchemaType = z.infer<typeof CreateClientSchema>["body"]
export type EditClientSchemaType = z.infer<typeof EditClientSchema>["body"]
export type EditClientParamsSchemaType = z.infer<typeof EditClientSchema>["params"]
export type DeleteClientSchemaType = z.infer<typeof DeleteClientSchema>["params"]
export type ListClientsQuerySchemaType = z.infer<typeof ListClientsSchema>["query"]
export type GetClientParamsSchemaType = z.infer<typeof GetClientSchema>["params"]
export type ClientProfileParamsSchemaType = z.infer<typeof ClientProfileSchema>["params"]