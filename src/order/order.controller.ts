import { NextFunction, Request, Response, Router } from "express";
import ISession from "interfaces/session.interface";
import { Schema, Types } from "mongoose";

import HttpException from "../exceptions/Http.exception";
import IdNotValidException from "../exceptions/IdNotValid.exception";
import OfferNotFoundException from "../exceptions/OfferNotFount.exception";
import OrderDetailNotFoundException from "../exceptions/OrderDetailNotFound.exception";
import OrderNotFoundException from "../exceptions/OrderNotFound.exception";
import UserIdCannotChangeException from "../exceptions/UserIdCannotChangeException";
import IController from "../interfaces/controller.interface";
import IRequestWithUser from "../interfaces/requestWithUser.interface";
import authMiddleware from "../middleware/auth.middleware";
import validationMiddleware from "../middleware/validation.middleware";
import offerModel from "../offer/offer.model";
// import productModel from "../product/product.model";
import CreateOrderDto from "./order.dto";
import IOrder from "./order.interface";
import orderModel from "./order.model";

export default class OrderController implements IController {
    public path = "/orders";
    public router = Router();
    private order = orderModel;
    private offer = offerModel;
    // private product = productModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, authMiddleware, this.getAllOrders);
        this.router.get(`${this.path}/:id`, authMiddleware, this.getOrderById);
        this.router.patch(`${this.path}/:id`, [authMiddleware, validationMiddleware(CreateOrderDto, true)], this.modifyOrder);
        this.router.post(this.path, [authMiddleware, validationMiddleware(CreateOrderDto)], this.createOrder);
        this.router.delete(`${this.path}/:id`, authMiddleware, this.deleteOrder);
        this.router.delete(`${this.path}/:id/:detail_id`, authMiddleware, this.deleteFromDetails);
    }

    // LINK ./order.controller.yml#getAllOrders
    // ANCHOR[id=getAllOrders]
    private getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const count = await this.order.countDocuments();
            const orders = await this.order.find().sort({ _id: 1 });
            res.append("x-total-count", `${count}`);
            res.send(orders);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./order.controller.yml#getOrderById
    // ANCHOR[id=getOrderById]
    private getOrderById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const order = await this.order.findById(id);
                if (order) {
                    res.send(order);
                } else {
                    next(new OrderNotFoundException(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./order.controller.yml#modifyOrder
    // ANCHOR[id=modifyOrder]
    private modifyOrder = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const orderData: IOrder = req.body;

                if (orderData.user_id) {
                    next(new UserIdCannotChangeException());
                    return;
                }

                if (orderData.details) {
                    // check offer(s)
                    for (const e of orderData.details) {
                        const offer = await this.offer.findOne({ _id: e.offer_id });
                        if (!offer) {
                            next(new OfferNotFoundException(e.offer_id.toString()));
                            return;
                        }
                    }
                    
                }
                const order = await this.order.findByIdAndUpdate(id, orderData, { new: true });
                if (order) {
                    res.send(order);
                } else {
                    next(new OrderNotFoundException(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./order.controller.yml#createOrder
    // ANCHOR[id=createOrder]
    private createOrder = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
        try {
            const orderData: IOrder = req.body;
            const uid: Schema.Types.ObjectId = (req.session as ISession).user_id;
            const createdOrder = new this.order({
                ...orderData,
                user_id: [uid],
            });

            // check offer(s)
            for (const e of createdOrder.details) {
                const offer = await this.offer.findOne({ _id: e.offer_id });
                if (!offer) {
                    next(new OfferNotFoundException(e.offer_id.toString()));
                    return;
                }
            }

            const savedOrder = await createdOrder.save();
            const count = await this.order.countDocuments();
            res.append("x-total-count", `${count}`);
            res.send(savedOrder);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./order.controller.yml#deleteOrder
    // ANCHOR[id=deleteOrder]
    private deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const order = await this.order.findOne({ _id: id });
                if (order) {
                    await this.order.findByIdAndDelete(id);
                    const count = await this.order.countDocuments();
                    res.append("x-total-count", `${count}`);
                    res.sendStatus(200);
                } else {
                    next(new OrderNotFoundException(id));
                }
            } else next(new IdNotValidException(id));
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./order.controller.yml#deleteFromDetails
    // ANCHOR[id=deleteFromDetails]
    private deleteFromDetails = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const detail_id = req.params.detail_id;
            if (Types.ObjectId.isValid(id)) {
                const order = await this.order.findOne({ _id: id });
                if (order) {
                    const orderDetails = await this.order.findOne({ $and: [{ _id: id }, { details: { $elemMatch: { _id: detail_id } } }] });
                    if (orderDetails) {
                        await this.order.findOneAndUpdate({ _id: id }, { $pull: { details: { _id: detail_id } } });
                        res.sendStatus(200);
                    } else {
                        next(new OrderDetailNotFoundException(detail_id));
                    }
                } else {
                    next(new OrderNotFoundException(id));
                }
            } else next(new IdNotValidException(id));
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };
}
