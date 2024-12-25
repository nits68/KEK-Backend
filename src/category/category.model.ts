// https://mongoosejs.com/docs/validation.html

import { model, Schema } from "mongoose";

import ICategory from "./category.interface";

// LINK ./product.model.yml
const productSchema = new Schema<ICategory>(
    {
        _id: Schema.Types.ObjectId,
        category_name: String,
        main_category: String,
    },
    { versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

const productModel = model<ICategory>("Category", productSchema, "categories");

export default productModel;
