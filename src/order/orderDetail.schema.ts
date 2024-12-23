import { Schema } from "mongoose";

import IOrderDetail from "./orderDetail.interface";

// LINK ./orderDetail.schema.yml
const orderDetailSchema = new Schema<IOrderDetail>({
    _id: Schema.Types.ObjectId,
    offer_id: {
        type: Schema.Types.ObjectId,
        ref: "Offer",
        required: true,
    },
    quantity: {
        type: Number,
        min: 0,
        required: true,
    },
});

export default orderDetailSchema;
