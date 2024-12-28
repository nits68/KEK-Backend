import { NextFunction, Request, Response, Router } from "express";
import { Types } from "mongoose";

import CategoryNotFoundException from "../exceptions/CategoryNotFound.exception";
import HttpException from "../exceptions/Http.exception";
import IdNotValidException from "../exceptions/IdNotValid.exception";
import ReferenceErrorException from "../exceptions/ReferenceError.exception";
import IController from "../interfaces/controller.interface";
import IRequestWithUser from "../interfaces/requestWithUser.interface";
import authMiddleware from "../middleware/auth.middleware";
import roleCheckMiddleware from "../middleware/roleCheckMiddleware";
import validationMiddleware from "../middleware/validation.middleware";
import productModel from "../product/product.model";
import CreateCategoryDto from "./category.dto";
import ICategory from "./category.interface";
import categoryModel from "./category.model";

export default class CategoryController implements IController {
    public path = "/categories";
    public router = Router();
    private category = categoryModel;
    private product = productModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, authMiddleware, this.getAllCategories);
        this.router.get(`${this.path}/:id`, authMiddleware, this.getCategoryById);
        this.router.patch(
            `${this.path}/:id`,
            [authMiddleware, validationMiddleware(CreateCategoryDto, true), roleCheckMiddleware(["admin"])],
            this.modifyCategory,
        );
        this.router.post(this.path, [authMiddleware, validationMiddleware(CreateCategoryDto), roleCheckMiddleware(["admin"])], this.createCategory);
        this.router.delete(`${this.path}/:id`, [authMiddleware, roleCheckMiddleware(["admin"])], this.deleteCategory);
        this.router.get(`${this.path}/main/all`, authMiddleware, this.getMainCategories);
        this.router.get(`${this.path}/by/:main`, authMiddleware, this.getCategoriesByMainCategory);
    }

    // LINK ./category.controller.yml#getAllCategories
    // ANCHOR[id=getAllCategories]
    private getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const count = await this.category.countDocuments();
            const categories = await this.category.find().sort({ _id: 1 });
            res.append("x-total-count", `${count}`);
            res.send(categories);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./category.controller.yml#getCategoryById
    // ANCHOR[id=getCategoryById]
    private getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const category = await this.category.findById(id);
                if (category) {
                    res.send(category);
                } else {
                    next(new CategoryNotFoundException(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./category.controller.yml#modifyCategory
    // ANCHOR[id=modifyCategory]
    private modifyCategory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const categoryData: ICategory = req.body;
                const category = await this.category.findByIdAndUpdate(id, categoryData, { new: true });
                if (category) {
                    res.send(category);
                } else {
                    next(new CategoryNotFoundException(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./category.controller.yml#createCategory
    // ANCHOR[id=createCategory]
    private createCategory = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
        try {
            const categoryData: ICategory = req.body;
            const createdCategory = new this.category({
                ...categoryData,
            });
            const savedCategory = await createdCategory.save();
            const count = await this.category.countDocuments();
            res.append("x-total-count", `${count}`);
            res.send(savedCategory);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./category.controller.yml#deleteCategory
    // ANCHOR[id=deleteCategory]
    private deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const isCategoryHasReferenceInProduct = await this.product.findOne({ category_id: id });
                if (isCategoryHasReferenceInProduct) {
                    next(new ReferenceErrorException("categories"));
                } else {
                    const successResponse = await this.category.findByIdAndDelete(id);
                    if (successResponse) {
                        res.sendStatus(204);
                    } else {
                        next(new CategoryNotFoundException(id));
                    }
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./category.controller.yml#getMainCategories
    // ANCHOR[id=getMainCategories]
    private getMainCategories = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const mainCategories = await this.category.distinct("main_category").sort({ main_category: 1 });
            res.append("x-total-count", `${mainCategories.length}`);
            res.send(mainCategories);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./category.controller.yml#getCategoriesByMainCategory
    // ANCHOR[id=getCategoriesByMainCategory]
    private getCategoriesByMainCategory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this.category.find({ main_category: req.params.main }, { main_category: 0 }).sort({ category_name: 1 });
            res.append("x-total-count", `${data.length}`);
            res.send(data);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };
}
