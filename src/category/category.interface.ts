import { Schema } from "mongoose";

export default interface IProduct {
    _id?: Schema.Types.ObjectId;
    category_name: string;
    main_category: string;
}
