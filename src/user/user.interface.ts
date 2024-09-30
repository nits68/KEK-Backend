import { Schema } from "mongoose";

export default interface IUser {
    _id?: Schema.Types.ObjectId; // aaaa00000000000000000001
    name?: string;
    email?: string;
    email_verified?: boolean;
    password?: string;
    roles?: string[];
    mobil_number?: string;
}
