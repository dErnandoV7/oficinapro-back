import { Router } from "express";

import { adminRoutes } from "./admin.routes";
import { clientRoutes } from "./client.routes";
import { productRoutes } from "./product.routes";
import { saleRoutes } from "./sale.routes";
import { paymentRoutes } from "./payment.routes";
import { dashboardRoutes } from "./dashboard.routes";

const routes = Router();

routes.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

routes.use("/admin", adminRoutes);
routes.use("/clients", clientRoutes);
routes.use("/products", productRoutes);
routes.use("/sales", saleRoutes);
routes.use("/payments", paymentRoutes);
routes.use("/dashboard", dashboardRoutes);

export { routes };
