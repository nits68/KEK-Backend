import HttpException from "./Http.exception";

export default class ReferenceErrorException2 extends HttpException {
    constructor(field: string, collection: string) {
        super(409, `The referenced primary key in ${field} field could not be found in collection ${collection}`);
    }
}
