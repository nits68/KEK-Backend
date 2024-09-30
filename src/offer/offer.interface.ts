import { Schema } from "mongoose";

import IOfferDetail from "./offerDetail.interface";

export default interface IOffer {
    _id?: Schema.Types.ObjectId;
    user_id?: Schema.Types.ObjectId;
    offer_date?: Date;
    details: IOfferDetail[];
}
