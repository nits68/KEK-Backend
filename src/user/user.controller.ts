import { NextFunction, Request, Response, Router } from "express";
import { Types } from "mongoose";

// import authorModel from "../author/author.model";
import HttpException from "../exceptions/Http.exception";
import IdNotValidException from "../exceptions/IdNotValid.exception";
import ReferenceErrorException from "../exceptions/ReferenceError.exception";
import UserNotFoundException from "../exceptions/UserNotFound.exception";
import IController from "../interfaces/controller.interface";
import authMiddleware from "../middleware/auth.middleware";
import validationMiddleware from "../middleware/validation.middleware";
import offerModel from "../offer/offer.model";
import orderModel from "../order/order.model";
import CreateUserDto from "./user.dto";
import IUser from "./user.interface";
import userModel from "./user.model";

export default class UserController implements IController {
    public path = "/users";
    public router = Router();
    private user = userModel;
    private order = orderModel;
    private offer = offerModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/:id`, authMiddleware, this.getUserById);
        this.router.get(this.path, authMiddleware, this.getAllUsers);
        this.router.patch(`${this.path}/:id`, [authMiddleware, validationMiddleware(CreateUserDto, true)], this.modifyUser);
        this.router.delete(`${this.path}/:id`, authMiddleware, this.deleteUser);
    }

    // LINK ./user.controller.yml#getAllUsers
    // ANCHOR[id=getAllUsers]
    private getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const count = await this.user.countDocuments();
            this.user
                .find()
                .sort({ _id: 1 })
                .then(users => {
                    res.append("x-total-count", `${count}`);
                    res.send(users);
                });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // LINK ./user.controller.yml#getUserById
    // ANCHOR[id=getUserById]
    private getUserById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                // Multiple populates:
                // const user = await this.user.findById(id).populate("recipes").populate("recipes");
                const user = await this.user.findById(id);
                if (user) {
                    res.send(user);
                } else {
                    next(new UserNotFoundException(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private modifyUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const userData: IUser = req.body;
                const user = await this.user.findByIdAndUpdate(id, userData, { new: true });
                if (user) {
                    res.send(user);
                } else {
                    next(new UserNotFoundException(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const isUserHasOrder = await this.order.findOne({ user_id: id });
                const isUserHasOffer = await this.offer.findOne({ user_id: id });
                if (isUserHasOrder || isUserHasOffer) {
                    next(new ReferenceErrorException("users"));
                } else {
                    const successResponse = await this.user.findByIdAndDelete(id);
                    if (successResponse) {
                        res.sendStatus(200);
                    } else {
                        next(new UserNotFoundException(id));
                    }
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };
}
