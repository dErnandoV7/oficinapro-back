import { Router } from "express";

import { authMiddleware } from "../common/middlewares/authMiddleware";
import { validate } from "../common/middlewares/validadeMiddleware";
import { CreateClientSchema, DeleteClientSchema, EditClientSchema } from "../common/schemas/client.schemas";
import { ClientController } from "../modules/client/client.controller";

const clientRoutes = Router();

clientRoutes.post("/", authMiddleware, validate(CreateClientSchema), ClientController.create);
clientRoutes.patch("/:clientId", authMiddleware, validate(EditClientSchema), ClientController.edit);
clientRoutes.delete("/:clientId", authMiddleware, validate(DeleteClientSchema), ClientController.delete);

export { clientRoutes };
