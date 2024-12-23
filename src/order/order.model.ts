// https://mongoosejs.com/docs/validation.html

import { model, Schema } from "mongoose";

import IOrder from "./order.interface";
import orderDetailSchema from "./orderDetail.schema";

// LINK ./order.model.yml
const orderSchema = new Schema<IOrder>(
    {
        _id: Schema.Types.ObjectId,
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        details: {
            type: [orderDetailSchema],
            required: true,
        },
        order_date: {
            type: Date,
            default: Date.now,
        },
    },
    { versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

const orderModel = model<IOrder>("Order", orderSchema, "orders");

export default orderModel;
