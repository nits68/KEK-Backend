import { ArrayNotEmpty, IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Schema } from "mongoose";

import IOffer from "./offer.interface";
import IOfferDetail from "./offerDetail.interface";

export default class CreateOfferDto implements IOffer {
    @IsMongoId()
    @IsOptional()
    _id: Schema.Types.ObjectId;

    @IsNotEmpty()
    @IsOptional()
    @IsMongoId()
    user_id: Schema.Types.ObjectId;

    @IsString()
    @IsOptional()
    offer_date?: Date;

    @IsArray()
    @ArrayNotEmpty()
    details: IOfferDetail[];
}
