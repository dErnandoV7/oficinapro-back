import { Router } from "express";

import { adminRoutes } from "./admin.routes";

const routes = Router();

routes.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

routes.use("/admin", adminRoutes);

export { routes };
