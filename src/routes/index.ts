import { Router } from "express";

import { adminRoutes } from "./admin.routes";
import { clientRoutes } from "./client.routes";
import { productRoutes } from "./product.routes";

const routes = Router();

routes.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

routes.use("/admin", adminRoutes);
routes.use("/clients", clientRoutes);
routes.use("/products", productRoutes);

export { routes };
