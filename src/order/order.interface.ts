import { Schema } from "mongoose";

import IOrderDetail from "./orderDetail.interface";

export default interface IOrder {
    _id?: Schema.Types.ObjectId;
    user_id?: Schema.Types.ObjectId;
    order_date?: Date;
    details: IOrderDetail[];
}
