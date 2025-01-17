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
            immutable: true,
        },
        product_id: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
            immutable: true,
        },
        offer_start: {
            type: Date,
            default: Date.now(),
            immutable: true,
        },
        offer_end: {
            type: Date || null,
            default: null,
            validate: [dateValidator, "Offer start date must be less than offer end date"],
        },
        unit_price: {
            type: Number,
            required: true,
            immutable: true,
            get: (v: number) => Math.round(v),
            set: (v: number) => Math.round(v),
        },
        unit: {
            type: String,
            required: true,
            immutable: true,
        },
        quantity: {
            type: Number,
            required: true,
            get: (v: number) => Math.round(v),
            set: (v: number) => Math.round(v),
        },
        picture_url: {
            type: String,
            default: "none",
        },
        info: {
            type: String,
            default: "none",
            immutable: true,
        },
    },
    { versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// function that validate the startDate and endDate
function dateValidator(value: Date | null): boolean {
    // `this` is the mongoose document
    if (value === null)  return true;
    return this.offer_start <= value;
  }

const offerModel = model<IOffer>("Offer", offerSchema, "offers");

export default offerModel;
