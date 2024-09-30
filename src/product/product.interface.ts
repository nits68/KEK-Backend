import { Schema } from "mongoose";

export default interface IProduct {
    _id?: Schema.Types.ObjectId;
    product_name: string;
    unit: string;
    picture: string;
    category_id: Schema.Types.ObjectId;
}
