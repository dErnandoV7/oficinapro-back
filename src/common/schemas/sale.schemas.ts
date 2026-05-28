import z from "zod"

const SaleItemSchema = z.object({
    catalogItemId: z.string().uuid("catalogItemId inválido.").optional(),
    customDesc: z.string().min(1, "customDesc não pode ser vazio.").optional(),
    quantity: z.number().int().min(1, "Quantidade mínima é 1."),
    unitPrice: z.number().positive("unitPrice deve ser positivo.").optional(),
}).superRefine((item, ctx) => {
    if (!item.catalogItemId && !item.customDesc) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Cada item precisa de catalogItemId ou customDesc.",
            path: ["customDesc"],
        })
    }
    if (!item.catalogItemId && item.unitPrice === undefined) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "unitPrice é obrigatório para itens sem catalogItemId.",
            path: ["unitPrice"],
        })
    }
})

export const CreateSaleSchema = z.object({
    body: z.object({
        clientId: z.string().uuid("clientId inválido.").optional(),
        customName: z.string().min(1, "customName não pode ser vazio.").optional(),
        description: z.string().optional(),
        items: z.array(SaleItemSchema).min(1, "A venda precisa ter ao menos 1 item."),
    }).superRefine((body, ctx) => {
        if (!body.clientId && !body.customName) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Informe clientId ou customName para identificar a venda.",
                path: ["clientId"],
            })
        }
    }),
})

export const ListSalesSchema = z.object({
    query: z.object({
        clientId: z.string().uuid("clientId inválido.").optional(),
        paymentStatus: z.enum(["pendente", "parcial", "pago"]).optional(),
    }),
})

export const GetSaleSchema = z.object({
    params: z.object({
        saleId: z.string().uuid("O id da venda é inválido."),
    }),
})

export type CreateSaleTypes = z.infer<typeof CreateSaleSchema>["body"]
export type ListSalesTypes = z.infer<typeof ListSalesSchema>["query"]
export type GetSaleTypes = z.infer<typeof GetSaleSchema>["params"]
