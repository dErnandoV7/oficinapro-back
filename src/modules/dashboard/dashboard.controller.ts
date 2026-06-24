import { Request, Response, NextFunction } from "express"
import { BadRequest } from "../../common/utils/error"
import { DashboardService } from "./dashboard.service"

export const DashboardController = {
    async getSummary(req: Request, res: Response, next: NextFunction) {
        const storeId = res.locals.storeId

        try {
            if (!storeId) throw new BadRequest("Token inválido ou ausente.")

            const summary = await DashboardService.getSummary(storeId)

            return res.status(200).json({
                message: "Resumo do dashboard carregado com sucesso.",
                data: summary
            })
        } catch (error) {
            next(error)
        }
    }
}
