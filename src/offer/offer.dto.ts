import { IsDateString, IsMongoId, IsNumber, IsOptional, IsString } from "class-validator";
import { Schema } from "mongoose";

import IOffer from "./offer.interface";

export default class CreateOfferDto implements IOffer {
    @IsMongoId()
    @IsOptional()
    _id: Schema.Types.ObjectId;

    @IsMongoId()
    user_id: Schema.Types.ObjectId;

    @IsMongoId()
    product_id: Schema.Types.ObjectId;

    @IsDateString()
    @IsOptional()
    offer_start: Date;
    
    @IsDateString()
    @IsOptional()
    offer_end: Date;

    @IsString()
    unit: string;

    @IsNumber()
    unit_price: number;

    @IsNumber()
    quantity: number;
}
