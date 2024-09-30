import { model, Schema } from "mongoose";

import IOffer from "./offer.interface";
import offerDetailSchema from "./offerDetail.schema";

// LINK ./offer.model.yml

const offerSchema = new Schema<IOffer>(
    {
        _id: Schema.Types.ObjectId,
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        details: {
            type: [offerDetailSchema],
            required: true,
        },
        offer_date: {
            type: Date,
            default: Date.now,
        },
    },
    { versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

const offerModel = model<IOffer>("Offer", offerSchema, "offers");

export default offerModel;
