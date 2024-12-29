import { NextFunction, Request, Response, Router } from "express";
import { Types } from "mongoose";

import HttpException from "../exceptions/Http.exception";
import IdNotValidException from "../exceptions/IdNotValid.exception";
import ProductNotFoundException from "../exceptions/ProductNotFound.exception";
import ReferenceErrorException from "../exceptions/ReferenceError.exception";
import IController from "../interfaces/controller.interface";
import IRequestWithUser from "../interfaces/requestWithUser.interface";
import authMiddleware from "../middleware/auth.middleware";
import roleCheckMiddleware from "../middleware/roleCheckMiddleware";
import validationMiddleware from "../middleware/validation.middleware";
import offerModel from "../offer/offer.model";
import CreateProductDto from "./product.dto";
import IProduct from "./product.interface";
import productModel from "./product.model";

export default class ProductController implements IController {
    public path = "/products";
    public router = Router();
    private product = productModel;
    private offer = offerModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, authMiddleware, this.getAllProducts);
        this.router.get(`${this.path}/:id`, authMiddleware, this.getProductById);
        this.router.get(`${this.path}/keyword/:keyword`, authMiddleware, this.getProductsByKeyword);
        this.router.patch(`${this.path}/:id`, [authMiddleware, validationMiddleware(CreateProductDto, true), roleCheckMiddleware(["admin"])], this.modifyProduct);
        this.router.post(this.path, [authMiddleware, validationMiddleware(CreateProductDto), roleCheckMiddleware(["admin"])], this.createProduct);
        this.router.delete(`${this.path}/:id`, [authMiddleware, roleCheckMiddleware(["admin"])], this.deleteProduct);
    }

    // LINK ./product.controller.yml#getAllProducts
    // ANCHOR[id=getAllProducts]
    private getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const count = await this.product.countDocuments();
            const products = await this.product.find().populate('category').sort({ _id: 1 });
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
                const product = (await this.product.findOne({ _id: id }).populate('category'));
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
                const product = await this.product.findByIdAndUpdate(id, productData, { new: true }).populate('category');
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
                const isProductHasReferenceInOffers = await this.offer.findOne({ product_id: id });
                if (isProductHasReferenceInOffers) {
                    next(new ReferenceErrorException("products"));
                } else {
                    const successResponse = await this.product.findByIdAndDelete(id);
                    if (successResponse) {
                        res.sendStatus(204);
                    } else {
                        next(new ProductNotFoundException(id));
                    }
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./product.controller.yml#getProductsByKeyword
    // ANCHOR[id=getProductsByKeyword]
    private getProductsByKeyword = async (req: Request, res: Response) => {
        try {
            const myRegex = new RegExp(req.params.keyword, "i"); // "i" for case-insensitive

            const data = await this.product.aggregate([
                {
                    $lookup: {
                        from: "categories",
                        localField: "category_id",
                        foreignField: "_id",
                        as: "category",
                    },
                },
                {
                    $match: { $or: [{ product_name: myRegex }, { "category.category_name": myRegex }, { "category.main_category": myRegex }] },
                },
                {
                    $unwind: "$category",
                },
            ]);
            res.append("x-total-count", `${data.length}`);
            res.send(data);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };
}
