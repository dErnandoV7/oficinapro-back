import z, { optional } from "zod"

export const Order = ["asc", "desc"] as const

export const ItemType = ["PRODUCT", "SERVICE"] as const

export const CreateProductServiceSchema = z.object({
    body: z.object({
        type: z.enum(ItemType),

        name: z.string()
            .min(1, "O nome do produto não pode ser vazio"),

        description: z.string()
            .optional(),

        category: z.string()
            .optional(),

        costPrice: z.number(),

        sellPrice: z.number(),

        stock: z.number(),

        minStock: z.number()
    })
})

export const EditProductServiceSchema = z.object({
    body: z.object({

        name: z.string()
            .min(1, "O nome do produto não pode ser vazio")
            .optional(),

        description: z.string()
            .optional(),

        category: z.string()
            .optional(),

        costPrice: z.number()
            .optional(),

        sellPrice: z.number()
            .optional(),

        stock: z.number()
            .optional(),

        minStock: z.number()
            .optional()
    }),

    params: z.object({
        productId: z.string()
            .min(1, "O id do produto/serviço é obrigatório")
    }),
})

export const DeleteProductServiceSchema = z.object({
    params: z.object({
        productId: z.string()
            .min(1, "O id do produto/serviço é obrigatório")
    }),
})

export const ListProductServiceSchema = z.object({
    query: z.object({
        search: z.string()
            .optional(),

        order: z.enum(Order)
            .optional()
    })
})


export const GetProductServiceSchema = z.object({
    params: z.object({
        productId: z.string().min(1, "O id do produto/serviço é obrigatório")
    })
})

export type CreateProductServiceTypes = z.infer<typeof CreateProductServiceSchema>["body"]
export type EditProductServiceTypes = z.infer<typeof EditProductServiceSchema>["body"]
export type EditProductServiceParamsTypes = z.infer<typeof EditProductServiceSchema>["params"]
export type DeleteProductServiceTypes = z.infer<typeof DeleteProductServiceSchema>["params"]
export type GetProductServiceTypes = z.infer<typeof GetProductServiceSchema>["params"]
export type ListProductServiceTypes = z.infer<typeof ListProductServiceSchema>["query"]