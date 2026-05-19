import { Router } from "express"
import { authMiddleware } from "../common/middlewares/authMiddleware"
import { validate } from "../common/middlewares/validadeMiddleware"
import { CreateSaleSchema, GetSaleSchema, ListSalesSchema } from "../common/schemas/sale.schemas"
import { SaleController } from "../modules/sale/sale.controller"

const saleRoutes = Router()

saleRoutes.post("/", authMiddleware, validate(CreateSaleSchema), SaleController.create)
saleRoutes.get("/", authMiddleware, validate(ListSalesSchema), SaleController.list)
saleRoutes.get("/:saleId", authMiddleware, validate(GetSaleSchema), SaleController.getById)

export { saleRoutes }
