import { model, Schema } from "mongoose";

import IToken from "./token.interface";

const tokenSchema = new Schema<IToken>(
    {
        _userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
        token: { type: String, required: true },
        expireAt: { type: Date, default: Date.now, index: { expires: 86400000 } },
    },
    { versionKey: false, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

const tokenModel = model<IToken>("Token", tokenSchema);

export default tokenModel;
