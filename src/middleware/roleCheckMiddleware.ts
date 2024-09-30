import { NextFunction, Response } from "express";
import express from "express";

import HttpException from "../exceptions/Http.exception";
import InsufficientRoleException from "../exceptions/InsufficientRole.exception";
import IRequestWithUser from "../interfaces/requestWithUser.interface";
import ISession from "../interfaces/session.interface";

export default function roleCheckMiddleware(req_roles: string[]): express.RequestHandler {
    return (req: IRequestWithUser, res: Response, next: NextFunction) => {
        if (req.session.id && (req.session as ISession).roles) {
            const intersectRoles = (req.session as ISession).roles.filter(value => req_roles.includes(value));
            if (intersectRoles.length > 0) {
                next();
            } else {
                next(new InsufficientRoleException());
            }
        } else {
            next(new HttpException(400, "Error with session data"));
        }
    };
}
