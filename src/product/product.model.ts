// https://mongoosejs.com/docs/validation.html

import { model, Schema } from "mongoose";

import IProduct from "./product.interface";

// LINK ./product.model.yml
const productSchema = new Schema<IProduct>(
    {
        _id: Schema.Types.ObjectId,
        category_id: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        product_name: {
            type: String,
        },
        unit: String,
        picture_url: String,
    },
    { versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

const productModel = model<IProduct>("Product", productSchema, "products");

export default productModel;
