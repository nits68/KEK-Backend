import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsDateString, IsMongoId, IsNumber, IsOptional, Min, ValidateNested } from "class-validator";
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

    @IsNumber()
    @Min(0)
    @IsOptional()
    quantity?: number;

}

export default class CreateOrderDto implements IOrder {
    @IsMongoId()
    @IsOptional()
    _id: Schema.Types.ObjectId;

    // A hitelesített felhasználó lesz a "megrendelő", felesleges megadni
    // @IsNotEmpty()
    // @IsMongoId()
    // user_id: Schema.Types.ObjectId;

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
