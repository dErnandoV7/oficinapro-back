import z from "zod"

export const PaymentSortBy = ["createdAt", "amount", "client"] as const

export const CreatePaymentSchema = z.object({
    body: z.object({
        saleId: z.string().uuid("saleId inválido."),
        amount: z.number().positive("O valor do pagamento deve ser positivo."),
    })
})

export const ListPaymentsSchema = z.object({
    query: z.object({
        clientId: z.string().uuid("clientId inválido.").optional(),
        saleId: z.string().uuid("saleId inválido.").optional(),
        month: z.coerce.number().int().min(1, "Mês inválido.").max(12, "Mês inválido.").optional(),
        year: z.coerce.number().int().min(1900, "Ano inválido.").optional(),
        sortBy: z.enum(PaymentSortBy).optional(),
        order: z.enum(["asc", "desc"]).optional(),
    })
})

export type CreatePaymentTypes = z.infer<typeof CreatePaymentSchema>["body"]
export type ListPaymentsTypes = z.infer<typeof ListPaymentsSchema>["query"]
