import { Router } from "express"
import { authMiddleware } from "../common/middlewares/authMiddleware"
import { validate } from "../common/middlewares/validadeMiddleware"
import { CreatePaymentSchema, ListPaymentsSchema } from "../common/schemas/payment.schemas"
import { PaymentController } from "../modules/payment/payment.controller"

const paymentRoutes = Router()

paymentRoutes.post("/", authMiddleware, validate(CreatePaymentSchema), PaymentController.create)
paymentRoutes.get("/", authMiddleware, validate(ListPaymentsSchema), PaymentController.list)

export { paymentRoutes }
