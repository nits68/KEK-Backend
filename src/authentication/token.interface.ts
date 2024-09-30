import { Schema } from "mongoose";

export default interface IToken {
    _id?: Schema.Types.ObjectId;
    _userId: Schema.Types.ObjectId;
    token: string;
    expireAt: Date;
}
