import { NextFunction, Request, Response, Router } from "express";
import { Schema, Types } from "mongoose";

import FieldCannotModifiedException from "../exceptions/FieldCannotModified.exception";
import HttpException from "../exceptions/Http.exception";
import IdNotValidException from "../exceptions/IdNotValid.exception";
import OfferCannotModifiedException from "../exceptions/OfferCannotModified.exception";
import OfferNotFoundException from "../exceptions/OfferNotFount.exception";
import ReferenceErrorException from "../exceptions/ReferenceError.exception";
import ReferenceError2Exception from "../exceptions/ReferenceError2.exception";
import IController from "../interfaces/controller.interface";
import IRequestWithUser from "../interfaces/requestWithUser.interface";
import ISession from "../interfaces/session.interface";
import authMiddleware from "../middleware/auth.middleware";
import roleCheckMiddleware from "../middleware/roleCheckMiddleware";
import validationMiddleware from "../middleware/validation.middleware";
import orderModel from "../order/order.model";
import productModel from "../product/product.model";
import userModel from "../user/user.model";
import CreateOfferDto from "./offer.dto";
import IOffer from "./offer.interface";
import offerModel from "./offer.model";

export default class OfferController implements IController {
    public path = "/offers";
    public router = Router();
    private offer = offerModel;
    private order = orderModel;
    private user = userModel;
    private product = productModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, this.getAllOffer);
        this.router.get(`${this.path}/:id`, this.getOfferById);
        this.router.patch(`${this.path}/:id`, [authMiddleware, validationMiddleware(CreateOfferDto, true), roleCheckMiddleware(["admin"])], this.modifyOffer);
        this.router.post(this.path, [authMiddleware, validationMiddleware(CreateOfferDto), roleCheckMiddleware(["sp", "admin"])], this.createOffer);
        this.router.delete(`${this.path}/:id`, [authMiddleware, roleCheckMiddleware(["admin"])], this.deleteOffer);
        this.router.patch(
            `${this.path}/myoffer/:id`,
            [authMiddleware, validationMiddleware(CreateOfferDto, true), roleCheckMiddleware(["admin", "sp"])],
            this.modifyMyOffer,
        );
        this.router.get(`${this.path}/myoffer/:id`, [authMiddleware, roleCheckMiddleware(["admin", "sp"])], this.getMyOffers);
        this.router.delete(`${this.path}/myoffer/:id`, [authMiddleware, roleCheckMiddleware(["admin", "sp"])], this.deleteMyOffer);
        this.router.get(`${this.path}/:offset/:limit/:sortingfield/:filter`, this.getPaginatedOffers);
        this.router.get(`${this.path}/active/:offset/:limit/:sortingfield/:filter`, this.getPaginatedActiveOffers);
    }

    // LINK ./offer.controller.yml#getAllOffer
    // ANCHOR[id=getAllOffer]
    private getAllOffer = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const count = await this.offer.countDocuments();
            const offer = await this.offer.find().sort({ _id: 1 });
            res.append("x-total-count", `${count}`);
            res.send(offer);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./offer.controller.yml#getMyOffers
    // ANCHOR[id=getMyOffers]
    private getMyOffers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const uid: Schema.Types.ObjectId = (req.session as ISession).user_id;
            const myOffers = await this.offer.aggregate([
                { $lookup: { from: "products", localField: "product_id", foreignField: "_id", as: "product" } },
                { $lookup: { from: "categories", localField: "product.category_id", foreignField: "_id", as: "category" } },
                { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "offer" } },
                { $unwind: "$product" },
                { $unwind: "$category" },
                { $unwind: "$offer" },
                {
                    $match: {
                        user_id: uid,
                    },
                },
                {
                    $project: {
                        _id: 1,
                        offer_start: 1,
                        offer_end: 1,
                        unit: 1,
                        unit_price: 1,
                        picture_url: 1,
                        quantity: 1,
                        info: 1,
                        product: {
                            product_name: 1,
                            picture_url: 1,
                        },
                        category: {
                            category_name: 1,
                            main_category: 1,
                        },
                        offer: {
                            name: 1,
                            email: 1,
                        },
                    },
                },
            ]);
            res.append("x-total-count", `${myOffers.length}`);
            res.send(myOffers);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    //LINK ./Offer.controller.yml#getOrderById
    //ANCHOR[id=getOfferById]
    private getOfferById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const offer = await this.offer.findById(id);
                if (offer) {
                    res.send(offer);
                } else {
                    next(new OfferNotFoundException(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./Offer.controller.yml#modifyOffer
    // ANCHOR[id=modifyOffer]
    private modifyOffer = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const offerData: IOffer = req.body;

                // Send error if try to modify immutable fields:
                if (offerData.offer_start) {
                    return next(new FieldCannotModifiedException("offer_start"));
                }
                if (offerData.user_id) {
                    return next(new FieldCannotModifiedException("user_id"));
                }
                if (offerData.product_id) {
                    return next(new FieldCannotModifiedException("product_id"));
                }
                if (offerData.unit_price) {
                    return next(new FieldCannotModifiedException("unit_price"));
                }
                if (offerData.unit) {
                    return next(new FieldCannotModifiedException("unit"));
                }
                if (offerData.info) {
                    return next(new FieldCannotModifiedException("info"));
                }

                const offer = await this.offer.findByIdAndUpdate(id, offerData, { new: true });
                if (offer) {
                    res.send(offer);
                } else {
                    next(new OfferNotFoundException(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./offer.controller.yml#createOffer
    // ANCHOR[id=createOffer]
    private createOffer = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
        try {
            const offerData: IOffer = req.body;

            // Check product_id value exist in products collection _id field:
            const isProductIdCorrect = await this.product.findOne({ _id: offerData.product_id });
            if (!isProductIdCorrect) {
                next(new ReferenceError2Exception("product_id", "products"));
            }

            const uid: Schema.Types.ObjectId = (req.session as ISession).user_id;
            const createdOffer = new this.offer({
                ...offerData,
                user_id: uid,
            });
            const savedOffer = await createdOffer.save();
            const count = await this.offer.countDocuments();
            res.append("x-total-count", `${count}`);
            res.send(savedOffer);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./Offer.controller.yml#deleteOffer
    // ANCHOR[id=deleteOffer]
    private deleteOffer = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const isOfferHasReference = await this.order.findOne({ details: { $elemMatch: { offer_id: id } } });
                if (isOfferHasReference) {
                    next(new ReferenceErrorException("offer"));
                } else {
                    const offer = await this.offer.findOne({ _id: id });
                    if (offer) {
                        await this.offer.findByIdAndDelete(id);
                        const count = await this.offer.countDocuments();
                        res.append("x-total-count", `${count}`);
                        res.sendStatus(200);
                    } else {
                        next(new OfferNotFoundException(id));
                    }
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./Offer.controller.yml#modifyMyOffer
    // ANCHOR[id=modifyMyOffer]
    private modifyMyOffer = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const offer = await this.offer.findOne({ _id: id });
                if (!offer) {
                    next(new OfferNotFoundException(id));
                } else {
                    if (offer.user_id.toString() === (req.session as ISession).user_id.toString()) {
                        const offerData: IOffer = req.body;

                        // Send error if try to modify immutable fields:
                        if (offerData.offer_start) {
                            return next(new FieldCannotModifiedException("offer_start"));
                        }
                        if (offerData.user_id) {
                            return next(new FieldCannotModifiedException("user_id"));
                        }
                        if (offerData.product_id) {
                            return next(new FieldCannotModifiedException("product_id"));
                        }
                        if (offerData.unit_price) {
                            return next(new FieldCannotModifiedException("unit_price"));
                        }
                        if (offerData.unit) {
                            return next(new FieldCannotModifiedException("unit"));
                        }
                        if (offerData.info) {
                            return next(new FieldCannotModifiedException("info"));
                        }
                        
                        const updatedOffer = await this.offer.findByIdAndUpdate(id, offerData, { new: true });
                        res.send(updatedOffer);
                    } else {
                        next(new OfferCannotModifiedException());
                    }
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./Offer.controller.yml#deleteMyOrder
    // ANCHOR[id=deleteMyOffer]
    private deleteMyOffer = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const isOfferHasReference = await this.order.findOne({ details: { $elemMatch: { offer_id: id } } });
                if (isOfferHasReference) {
                    next(new ReferenceErrorException("offer"));
                } else {
                    const offer = await this.offer.findOne({ _id: id });
                    if (!offer) {
                        next(new OfferNotFoundException(id));
                    } else {
                        if (offer.user_id.toString() === (req.session as ISession).user_id.toString()) {
                            await this.offer.findByIdAndDelete(id);
                            const count = await this.offer.countDocuments();
                            res.append("x-total-count", `${count}`);
                            res.sendStatus(200);
                        } else {
                            next(new OfferCannotModifiedException());
                        }
                    }
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    //LINK ./Offer.controller.yml#getPaginatedActiveOffers
    //ANCHOR[id=getPaginatedActiveOffers]

    private getPaginatedActiveOffers = async (req: Request, res: Response) => {
        try {
            const offset = parseInt(req.params.offset);
            const limit = parseInt(req.params.limit);
            const sortingfield = req.params.sortingfield; // with "-" prefix made DESC order
            let paginatedOffers: any[] = [];
            const actualDate = new Date();
            if (req?.params?.filter != "*") {
                const myRegex = new RegExp(req.params.filter, "i"); // i for case insensitive
                paginatedOffers = await this.offer.aggregate([
                    { $lookup: { from: "products", localField: "product_id", foreignField: "_id", as: "product" } },
                    { $lookup: { from: "categories", localField: "product.category_id", foreignField: "_id", as: "category" } },
                    { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "offer" } },
                    { $unwind: "$product" },
                    { $unwind: "$category" },
                    { $unwind: "$offer" },
                    {
                        $match: {
                            $and: [
                                { quantity: { $gt: 0 } },
                                { $or: [{ offer_end: { $eq: null } }, { offer_end: { $gte: actualDate } }] },
                                {
                                    $or: [
                                        { info: myRegex },
                                        { "product.product_name": myRegex },
                                        { "category.category_name": myRegex },
                                        { "category.main_category": myRegex },
                                        { "offer.name": myRegex },
                                        { "offer.email": myRegex },
                                    ],
                                },
                            ],
                        },
                    },
                    { $sort: { [sortingfield]: 1 } },
                    {
                        $project: {
                            _id: 1,
                            offer_start: 1,
                            offer_end: 1,
                            unit: 1,
                            unit_price: 1,
                            picture_url: 1,
                            quantity: 1,
                            info: 1,
                            product: {
                                product_name: 1,
                                picture_url: 1,
                            },
                            category: {
                                category_name: 1,
                                main_category: 1,
                            },
                            offer: {
                                name: 1,
                                email: 1,
                            },
                        },
                    },
                ]);
            } else {
                paginatedOffers = await this.offer.aggregate([
                    { $lookup: { from: "products", localField: "product_id", foreignField: "_id", as: "product" } },
                    { $lookup: { from: "categories", localField: "product.category_id", foreignField: "_id", as: "category" } },
                    { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "offer" } },
                    { $unwind: "$product" },
                    { $unwind: "$category" },
                    { $unwind: "$offer" },
                    {
                        $match: {
                            $and: [{ quantity: { $gt: 0 } }, { $or: [{ offer_end: { $eq: null } }, { offer_end: { $gte: actualDate } }] }],
                        },
                    },
                    { $sort: { [sortingfield]: 1 } },
                    {
                        $project: {
                            _id: 1,
                            offer_start: 1,
                            offer_end: 1,
                            unit: 1,
                            unit_price: 1,
                            picture_url: 1,
                            quantity: 1,
                            info: 1,
                            product: {
                                product_name: 1,
                                picture_url: 1,
                            },
                            category: {
                                category_name: 1,
                                main_category: 1,
                            },
                            offer: {
                                name: 1,
                                email: 1,
                            },
                        },
                    },
                ]);
            }
            res.append("X-Total-Count", `${paginatedOffers.length}`); // append total count of documents to response header
            res.send(paginatedOffers.slice(offset, offset + limit));
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };

    //LINK ./Offer.controller.yml#getPaginatedOffers
    //ANCHOR[id=getPaginatedOffers]

    private getPaginatedOffers = async (req: Request, res: Response) => {
        try {
            const offset = parseInt(req.params.offset);
            const limit = parseInt(req.params.limit);
            const sortingfield = req.params.sortingfield; // with "-" prefix made DESC order
            let paginatedOffers: any[] = [];
            if (req?.params?.filter != "*") {
                const myRegex = new RegExp(req.params.filter, "i"); // i for case insensitive
                paginatedOffers = await this.offer.aggregate([
                    { $lookup: { from: "products", localField: "product_id", foreignField: "_id", as: "product" } },
                    { $lookup: { from: "categories", localField: "product.category_id", foreignField: "_id", as: "category" } },
                    { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "offer" } },
                    { $unwind: "$product" },
                    { $unwind: "$category" },
                    { $unwind: "$offer" },
                    {
                        $match: {
                            $and: [
                                {
                                    $or: [
                                        { info: myRegex },
                                        { "product.product_name": myRegex },
                                        { "category.category_name": myRegex },
                                        { "category.main_category": myRegex },
                                        { "offer.name": myRegex },
                                        { "offer.email": myRegex },
                                    ],
                                },
                            ],
                        },
                    },
                    { $sort: { [sortingfield]: 1 } },
                    {
                        $project: {
                            _id: 1,
                            offer_start: 1,
                            offer_end: 1,
                            unit: 1,
                            unit_price: 1,
                            picture_url: 1,
                            quantity: 1,
                            info: 1,
                            product: {
                                product_name: 1,
                                picture_url: 1,
                            },
                            category: {
                                category_name: 1,
                                main_category: 1,
                            },
                            offer: {
                                name: 1,
                                email: 1,
                            },
                        },
                    },
                ]);
            } else {
                paginatedOffers = await this.offer.aggregate([
                    { $lookup: { from: "products", localField: "product_id", foreignField: "_id", as: "product" } },
                    { $lookup: { from: "categories", localField: "product.category_id", foreignField: "_id", as: "category" } },
                    { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "offer" } },
                    { $unwind: "$product" },
                    { $unwind: "$category" },
                    { $unwind: "$offer" },
                    { $sort: { [sortingfield]: 1 } },
                    {
                        $project: {
                            _id: 1,
                            offer_start: 1,
                            offer_end: 1,
                            unit: 1,
                            unit_price: 1,
                            picture_url: 1,
                            quantity: 1,
                            info: 1,
                            product: {
                                product_name: 1,
                                picture_url: 1,
                            },
                            category: {
                                category_name: 1,
                                main_category: 1,
                            },
                            offer: {
                                name: 1,
                                email: 1,
                            },
                        },
                    },
                ]);
            }
            res.append("x-total-count", `${paginatedOffers.length}`); // append total count of documents to response header
            res.send(paginatedOffers.slice(offset, offset + limit));
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };
}
