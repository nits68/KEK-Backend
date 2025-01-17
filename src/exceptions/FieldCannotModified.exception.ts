import HttpException from "./Http.exception";

export default class FieldCannotModifiedException extends HttpException {
    constructor(field: string) {
        super(403, `The ${field} cannot be modified! Try delete document and create a new offer.`);
    }
}
