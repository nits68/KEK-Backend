import { Schema } from "mongoose";

export default interface IUser {
    _id?: Schema.Types.ObjectId; // aaaa00000000000000000001
    name: string;
    email: string;
    email_verified?: boolean;
    password?: string;
    auto_login?: boolean;
    roles?: string[];
    mobile_number?: string;
    picture?: string;
}
