import { IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Schema } from "mongoose";

import ICategory from "./category.interface";

export default class CreateCategoryDto implements ICategory {
    @IsMongoId()
    @IsOptional()
    _id: Schema.Types.ObjectId;


    @IsString()
    @IsNotEmpty()
    category_name: string;

    @IsString()
    @IsNotEmpty()
    main_category: string;
}
