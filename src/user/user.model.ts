import { model, Schema } from "mongoose";

import IUser from "./user.interface";

// LINK ./user.model.yml
const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: [true, "Email already exists"],
        },
        email_verified: {
            type: Boolean,
            required: true,
        },

        name: {
            type: String,
            required: true,
            unique: [true, "Name already exists"],
        },

        password: {
            type: String,
            required: true,
        },

        auto_login: {
            type: Boolean,
            default: true,
        },

        roles: {
            type: [String], // Array of string
            required: true,
            default: ["user"],
        },

        mobile_number: {
            type: String,
            required: false,
        },

        picture: {
            type: String,
            required: false,
        },
    },
    { versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

const userModel = model<IUser>("User", userSchema, "users");

export default userModel;
