import { model, Schema } from "mongoose";

import IUser from "./user.interface";

// LINK ./user.model.yml
const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
        },
        email_verified: {
            type: Boolean,
            required: true,
        },

        name: {
            type: String,
            required: true,
        },

        password: {
            type: String,
            required: true,
        },
        roles: {
            type: [String], // Array of string
            required: true,
        },
        mobil_number: {
            type: String,
            required: false,
        },
    },
    { versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

const userModel = model<IUser>("User", userSchema, "users");

export default userModel;
