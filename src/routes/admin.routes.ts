import { Router } from "express";

import { validate } from "../common/middlewares/validadeMiddleware";
import { CreateAdminSchema, LoginAdminSchema } from "../common/schemas/admin.schemas";
import { AdminController } from "../modules/admin/admin.controller";

const adminRoutes = Router();

adminRoutes.post("/", validate(CreateAdminSchema), AdminController.create);
adminRoutes.post("/login", validate(LoginAdminSchema), AdminController.login);

export { adminRoutes };
