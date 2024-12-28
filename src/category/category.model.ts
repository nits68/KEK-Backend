// https://mongoosejs.com/docs/validation.html

import { model, Schema } from "mongoose";

import ICategory from "./category.interface";

// LINK ./category.model.yml
const categorySchema = new Schema<ICategory>(
    {
        _id: Schema.Types.ObjectId,
        category_name: 
        {
            type: String,
            unique: true,
            index: true,
        },
        main_category: 
        {
            type: String,
            unique: true,
            index: true,
        },
    },
    { versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

const productModel = model<ICategory>("Category", categorySchema, "categories");

export default productModel;
