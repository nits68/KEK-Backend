import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsDateString, IsInt, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";
import { Schema } from "mongoose";

import IOrder from "./order.interface";
import IOrderDetail from "./orderDetail.interface";

export class OrderDetails implements IOrderDetail {
    @IsMongoId()
    @IsOptional()
    _id?: Schema.Types.ObjectId;

    @IsMongoId()
    @IsOptional()
    offer_id?: Schema.Types.ObjectId;

    @IsMongoId()
    @IsOptional()
    product_id?: Schema.Types.ObjectId;

    @IsNumber()
    @Min(0)
    @IsOptional()
    quantity?: number;

    @IsInt()
    @Min(0)
    @Max(5)
    @IsOptional()
    stars?: number;
}

export default class CreateOrderDto implements IOrder {
    @IsMongoId()
    @IsOptional()
    _id: Schema.Types.ObjectId;

    // A hitelesített felhasználó lesz a "megrendelő", felesleges megadni
    // @IsNotEmpty()
    // @IsMongoId()
    // user_id: Schema.Types.ObjectId;

    @IsString()
    @IsNotEmpty()
    basket_id?: string;

    // @IsDate()
    @IsDateString()
    @IsOptional()
    order_date?: Date;

    @IsArray()
    @ValidateNested({ each: true })
    @ArrayNotEmpty()
    @Type(() => OrderDetails)
    details: OrderDetails[];
}
