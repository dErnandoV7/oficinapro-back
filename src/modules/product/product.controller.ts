import { NextFunction, Request, Response } from "express"
import { BadRequest, NotFoundError } from "../../common/utils/error"
import { CreateProductServiceTypes, EditProductServiceTypes, EditProductServiceParamsTypes, DeleteProductServiceTypes, GetProductServiceTypes, ListProductServiceTypes, RestockProductTypes, RestockProductParamsTypes } from "../../common/schemas/product.schemas"
import { ProductServiceRepository } from "./product.repository"

export const ProductServiceController = {
    async create(req: Request, res: Response, next: NextFunction) {
        const adminId = res.locals.userId
        const storeId = res.locals.storeId

        try {
            if (!adminId || !storeId) {
                throw new BadRequest("Token inválido ou ausente.")
            }

            const data = req.body as CreateProductServiceTypes
            const product = await ProductServiceRepository.create(data, storeId)

            return res.status(201).json({
                message: `O ${data.type} ${product.name} foi criado com sucesso.`,
                data: product
            })
        } catch (error) {
            next(error)
        }
    },

    async edit(req: Request, res: Response, next: NextFunction) {
        const adminId = res.locals.userId
        const storeId = res.locals.storeId

        try {
            if (!adminId || !storeId) {
                throw new BadRequest("Token inválido ou ausente.")
            }

            const data = req.body as EditProductServiceTypes
            const { productId } = req.params as EditProductServiceParamsTypes

            const product = await ProductServiceRepository.edit(data, productId)

            return res.status(200).json({
                message: `O ${product.type} ${product.name} foi editado com sucesso.`,
                data: product
            })
        } catch (error) {
            next(error)
        }
    },

    async delete(req: Request, res: Response, next: NextFunction) {
        const adminId = res.locals.userId
        const storeId = res.locals.storeId

        try {
            if (!adminId || !storeId) {
                throw new BadRequest("Token inválido ou ausente.")
            }

            const { productId } = req.params as DeleteProductServiceTypes
            const product = await ProductServiceRepository.delete(productId)

            return res.status(200).json({
                message: `O ${product.type} ${product.name} foi excluido com sucesso.`,
                data: product
            })
        } catch (error) {
            next(error)
        }
    },

    async getById(req: Request, res: Response, next: NextFunction) {
        const adminId = res.locals.userId
        const storeId = res.locals.storeId

        try {
            if (!adminId || !storeId) {
                throw new BadRequest("Token inválido ou ausente.")
            }

            const { productId } = req.params as GetProductServiceTypes
            const product = await ProductServiceRepository.findById(productId, storeId)

            if (!product) {
                return res.status(404).json({ message: "Produto/Serviço não encontrado." })
            }

            return res.status(200).json({
                message: "Produto encontrado.",
                data: product
            })
        } catch (error) {
            next(error)
        }
    },

    async restock(req: Request, res: Response, next: NextFunction) {
        const storeId = res.locals.storeId

        try {
            if (!storeId) throw new BadRequest("Token inválido ou ausente.")

            const { productId } = req.params as RestockProductParamsTypes
            const { quantity, reason } = req.body as RestockProductTypes

            const product = await ProductServiceRepository.findById(productId, storeId)
            if (!product) throw new NotFoundError("Produto não encontrado.")
            if (product.type === "SERVICE") throw new BadRequest("Não é possível reabastecer um serviço.")

            const updated = await ProductServiceRepository.restock(productId, quantity, reason)

            return res.status(200).json({
                message: `Estoque de "${updated.name}" atualizado para ${quantity} unidades.`,
                data: updated
            })
        } catch (error) {
            next(error)
        }
    },

    async list(req: Request, res: Response, next: NextFunction) {
        const adminId = res.locals.userId
        const storeId = res.locals.storeId

        try {
            if (!adminId || !storeId) {
                throw new BadRequest("Token inválido ou ausente.")
            }

            const data = req.query as ListProductServiceTypes

            const products = await ProductServiceRepository.list(data, storeId)

            return res.status(200).json({
                message: "Produtos buscados com sucesso",
                data: products
            })
        } catch (error) {
            next(error)
        }
    }
}