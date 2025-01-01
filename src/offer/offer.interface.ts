import { Schema } from "mongoose";


export default interface IOffer {
    _id?: Schema.Types.ObjectId;
    user_id?: Schema.Types.ObjectId;
    product_id?: Schema.Types.ObjectId;
    offer_start?: Date;
    offer_end?: Date | null;
    unit_price?: number;
    unit?: string;
    quantity?: number;
    picture_url?: string;
    info?: string;
}
