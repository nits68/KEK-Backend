import { model, Schema } from "mongoose";

import IOffer from "./offer.interface";

// LINK ./offer.model.yml

const offerSchema = new Schema<IOffer>(
    {
        _id: Schema.Types.ObjectId,
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        product_id: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },
        offer_start: {
            type: Date,
            default: Date.now(),
        },
        offer_end: {
            type: Date || null,
            default: null,
        },
        unit_price: {
            type: Number,
            required: true,
        },
        unit: {
            type: String, 
            required: true,
        },
        quantity: {
            type: Number,
            default: 0,
        },
    },
    { versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

const offerModel = model<IOffer>("Offer", offerSchema, "offers");

export default offerModel;
