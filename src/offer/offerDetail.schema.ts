import { Schema } from "mongoose";

import IOfferDetail from "./offerDetail.interface";

// LINK ./offerDetail.schema.yml
const offerDetailSchema = new Schema<IOfferDetail>({
    _id: Schema.Types.ObjectId,
    product_id: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    quantity: {
        type: Number,
        min: 0,
        required: true,
    },
    unit_price: {
        type: Number,
        min: 0,
        default: 0,
    },
});

export default offerDetailSchema;
