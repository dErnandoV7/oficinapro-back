import { Router } from "express";

import { authMiddleware } from "../common/middlewares/authMiddleware";
import { validate } from "../common/middlewares/validadeMiddleware";
import { CreateAdminSchema, CreateStoreSchema, LoginAdminSchema } from "../common/schemas/admin.schemas";
import { AdminController } from "../modules/admin/admin.controller";

const adminRoutes = Router();

adminRoutes.post("/", validate(CreateAdminSchema), AdminController.create);
adminRoutes.post("/login", validate(LoginAdminSchema), AdminController.login);

adminRoutes.post("/store", authMiddleware, validate(CreateStoreSchema), AdminController.createStore);

export { adminRoutes };
