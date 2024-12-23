import { Schema } from "mongoose";
export default interface IOrderDetail {
    _id?: Schema.Types.ObjectId;
    offer_id?: Schema.Types.ObjectId;
    quantity?: number;
}
