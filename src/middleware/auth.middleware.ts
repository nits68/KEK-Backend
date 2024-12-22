import { NextFunction, Response } from "express";

import EmailNotVerifiedException from "../exceptions/EmailNotVerified.exception";
import SessionExpiredException from "../exceptions/SessionExpired.exception";
import IRequestWithUser from "../interfaces/requestWithUser.interface";
import ISession from "../interfaces/session.interface";
import userModel from "../user/user.model";

export default async function authMiddleware(req: IRequestWithUser, res: Response, next: NextFunction): Promise<void> {
    if (req.session.id && (req.session as ISession).user_id) {
        try {
            const user = await userModel.findById((req.session as ISession).user_id);
            if (user && !user.email_verified) {
                next(new EmailNotVerifiedException(user.email));
            }
            if (user) {
                next();
            } else {
                next(new SessionExpiredException());
            }
        } catch {
            next(new SessionExpiredException());
        }
    } else {
        next(new SessionExpiredException());
    }
}
