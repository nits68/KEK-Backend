import "reflect-metadata";

import { IsEmail, IsMongoId, IsOptional, IsString } from "class-validator";
import { Schema } from "mongoose";

// import { Match } from "./match.decorator";
import IUser from "./user.interface";

export default class CreateUserDto implements IUser {
    @IsMongoId()
    @IsOptional()
    _id: Schema.Types.ObjectId;

    @IsString()
    @IsOptional()
    name: string;

    @IsEmail()
    email: string;

    // Example - compare two fields in document:
    // @IsEmail()
    // @Match("email", { message: "email and email_address_confirm don't match." })
    // public email_address_confirm: string;

    // @IsBoolean()
    // @IsOptional()
    // email_verified: boolean;

    @IsString()
    password: string;

    // roles set ["user"] in handler registration
    // @IsOptional()
    // @IsArray()
    // @ArrayNotEmpty()
    // @IsString({ each: true })
    // roles: string[];
}
