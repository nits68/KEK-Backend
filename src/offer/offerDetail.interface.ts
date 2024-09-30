import { Schema } from "mongoose";
export default interface IOfferDetail {
    _id?: Schema.Types.ObjectId;
    product_id?: Schema.Types.ObjectId;
    quantity?: number;
    unit_price: number;
}
