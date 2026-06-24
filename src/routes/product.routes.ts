import { Router } from "express";

import { authMiddleware } from "../common/middlewares/authMiddleware";
import { validate } from "../common/middlewares/validadeMiddleware";
import { CreateProductServiceSchema, DeleteProductServiceSchema, EditProductServiceSchema, GetProductServiceSchema, ListProductServiceSchema, RestockProductSchema } from "../common/schemas/product.schemas";
import { ProductServiceController } from "../modules/product/product.controller";

const productRoutes = Router();

productRoutes.post("/", authMiddleware, validate(CreateProductServiceSchema), ProductServiceController.create)
productRoutes.get("/", authMiddleware, validate(ListProductServiceSchema), ProductServiceController.list)
productRoutes.post("/:productId/restock", authMiddleware, validate(RestockProductSchema), ProductServiceController.restock)
productRoutes.get("/:productId", authMiddleware, validate(GetProductServiceSchema), ProductServiceController.getById)

productRoutes.patch("/:productId", authMiddleware, validate(EditProductServiceSchema), ProductServiceController.edit)
productRoutes.delete("/:productId", authMiddleware, validate(DeleteProductServiceSchema), ProductServiceController.delete)

export { productRoutes };
