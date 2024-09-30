import { NextFunction, Request, Response, Router } from "express";
import { Types } from "mongoose";

import HttpException from "../exceptions/Http.exception";
import IdNotValidException from "../exceptions/IdNotValid.exception";
import ProductNotFoundException from "../exceptions/ProductNotFound.exception";
import IController from "../interfaces/controller.interface";
import IRequestWithUser from "../interfaces/requestWithUser.interface";
import authMiddleware from "../middleware/auth.middleware";
import validationMiddleware from "../middleware/validation.middleware";
import CreateProductDto from "./product.dto";
import IProduct from "./product.interface";
import productModel from "./product.model";

export default class ProductController implements IController {
    public path = "/products";
    public router = Router();
    private product = productModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, authMiddleware, this.getAllProducts);
        this.router.get(`${this.path}/:id`, authMiddleware, this.getProductById);
        this.router.patch(`${this.path}/:id`, [authMiddleware, validationMiddleware(CreateProductDto, true)], this.modifyProduct);
        this.router.post(this.path, [authMiddleware, validationMiddleware(CreateProductDto)], this.createProduct);
        this.router.delete(`${this.path}/:id`, authMiddleware, this.deleteProduct);
    }

    // LINK ./product.controller.yml#getAllOrders
    // ANCHOR[id=getAllProducts]
    private getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const count = await this.product.countDocuments();
            const products = await this.product.find().sort({ _id: 1 });
            res.append("x-total-count", `${count}`);
            res.send(products);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./product.controller.yml#getOrderById
    // ANCHOR[id=getProductById]
    private getProductById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const product = await this.product.findById(id);
                if (product) {
                    res.send(product);
                } else {
                    next(new ProductNotFoundException(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./product.controller.yml#modifyProduct
    // ANCHOR[id=modifyProduct]
    private modifyProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const productData: IProduct = req.body;
                const product = await this.product.findByIdAndUpdate(id, productData, { new: true });
                if (product) {
                    res.send(product);
                } else {
                    next(new ProductNotFoundException(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./product.controller.yml#createProduct
    // ANCHOR[id=createProduct]
    private createProduct = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
        try {
            const productData: IProduct = req.body;
            const createdProduct = new this.product({
                ...productData,
            });
            const savedProduct = await createdProduct.save();
            const count = await this.product.countDocuments();
            res.append("x-total-count", `${count}`);
            res.send(savedProduct);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./product.controller.yml#deleteProduct
    // ANCHOR[id=deleteProduct]
    private deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const product = await this.product.findOne({ _id: id });
                if (product) {
                    await this.product.findByIdAndDelete(id);
                    const count = await this.product.countDocuments();
                    res.append("x-total-count", `${count}`);
                    res.sendStatus(200);
                } else {
                    next(new ProductNotFoundException(id));
                }
            } else next(new IdNotValidException(id));
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };
}
