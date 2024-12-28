import { IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Schema } from "mongoose";

import IProduct from "./product.interface";

export default class CreateProductDto implements IProduct {
    @IsMongoId()
    @IsOptional()
    _id: Schema.Types.ObjectId;

    @IsNotEmpty()
    @IsMongoId()
    category_id: Schema.Types.ObjectId;

    @IsString()
    @IsNotEmpty()
    product_name: string;

    @IsString()
    @IsOptional()
    picture_url: string;
}
