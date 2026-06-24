import { Router } from "express"
import { authMiddleware } from "../common/middlewares/authMiddleware"
import { DashboardController } from "../modules/dashboard/dashboard.controller"

const dashboardRoutes = Router()

dashboardRoutes.get("/summary", authMiddleware, DashboardController.getSummary)

export { dashboardRoutes }
