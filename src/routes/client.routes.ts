import { Router } from "express";

import { authMiddleware } from "../common/middlewares/authMiddleware";
import { validate } from "../common/middlewares/validadeMiddleware";
import { ClientProfileSchema, CreateClientSchema, DeleteClientSchema, EditClientSchema, GetClientSchema, ListClientsSchema } from "../common/schemas/client.schemas";
import { ClientController } from "../modules/client/client.controller";

const clientRoutes = Router();

clientRoutes.post("/", authMiddleware, validate(CreateClientSchema), ClientController.create);
clientRoutes.get("/", authMiddleware, validate(ListClientsSchema), ClientController.list);

clientRoutes.get("/:clientId/profile", authMiddleware, validate(ClientProfileSchema), ClientController.profile);
clientRoutes.get("/:clientId", authMiddleware, validate(GetClientSchema), ClientController.getById);

clientRoutes.patch("/:clientId", authMiddleware, validate(EditClientSchema), ClientController.edit);
clientRoutes.delete("/:clientId", authMiddleware, validate(DeleteClientSchema), ClientController.delete);

export { clientRoutes };
