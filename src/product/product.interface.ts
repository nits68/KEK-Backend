import { Schema } from "mongoose";

export default interface IProduct {
    _id?: Schema.Types.ObjectId;
    product_name: string;
    picture_url: string;
    category_id: Schema.Types.ObjectId;
}
